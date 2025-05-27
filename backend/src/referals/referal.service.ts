import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ClientReferralInfo,
  IReferalService,
  LinkReferrerDto,
  AwardBonusesDto,
  FindReferralsDto,
} from './interfaces';
import { PrismaService } from '../prisma';
import { Client } from '@prisma/client';

const REFERRAL_PERCENTAGES = [0.06, 0.04, 0.02]; // 6% для 1-го уровня, 4% для 2-го, 2% для 3-го

@Injectable()
export class ReferalService implements IReferalService {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(data: LinkReferrerDto): Promise<ClientReferralInfo | null> {
    try {
      const { clientId, referrerId } = data;

      if (clientId === referrerId) {
        throw new HttpException(
          'Клиент не может быть реферером для самого себя.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const [clientToLink, referrerClient] = await Promise.all([
        this._prismaService.client.findUnique({ where: { id: clientId } }),
        this._prismaService.client.findUnique({ where: { id: referrerId } }),
      ]);

      if (!clientToLink) {
        throw new HttpException(
          `Клиент с ID ${clientId} для привязки не найден.`,
          404,
        );
      }
      if (!referrerClient) {
        throw new HttpException(`Реферер с ID ${referrerId} не найден.`, 404);
      }

      if (clientToLink.referrerId === referrerId) {
        return this.mapToClientReferralInfo(clientToLink);
      }
      if (referrerClient.referrerId === clientId) {
        throw new HttpException(
          `Нельзя установить циклическую реферальную связь: ${referrerClient.name} уже является рефералом ${clientToLink.name}.`,
          400,
        );
      }

      const updatedClient = await this._prismaService.client.update({
        where: { id: clientId },
        data: {
          referrerId: referrerId,
        },
        select: {
          id: true,
          name: true,
          lastName: true,
          phoneNumber: true,
          score: true,
          referrerId: true,
        },
      });
      return this.mapToClientReferralInfo(updatedClient);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при привязке реферера.', 500);
    }
  }

  async find(params: FindReferralsDto): Promise<ClientReferralInfo[]> {
    try {
      const { clientId, direction, maxLevels: queryMaxLevels } = params;

      const clientExists = await this._prismaService.client.findUnique({
        where: { id: clientId },
        select: { id: true },
      });

      if (!clientExists) {
        throw new HttpException(`Клиент с ID ${clientId} не найден.`, 404);
      }

      if (direction === 'upline') {
        const uplineReferrers: ClientReferralInfo[] = [];
        let currentClientId: string | null = clientId;
        const maxDepth = queryMaxLevels ?? REFERRAL_PERCENTAGES.length;
        let level = 0;

        while (currentClientId && level < maxDepth) {
          const client = await this._prismaService.client.findUnique({
            where: { id: currentClientId },
            select: {
              referrerId: true,
            },
          });

          if (!client || !client.referrerId) {
            break;
          }

          const referrer = await this._prismaService.client.findUnique({
            where: { id: client.referrerId },
            select: {
              id: true,
              name: true,
              lastName: true,
              phoneNumber: true,
              score: true,
            },
          });

          if (!referrer) break;

          uplineReferrers.push(this.mapToClientReferralInfo(referrer));
          currentClientId = referrer.id;
          level++;
        }
        return uplineReferrers;
      } else if (direction === 'downline_direct') {
        const findOptions: {
          where: { referrerId: string };
          take?: number;
          select: any;
        } = {
          where: { referrerId: clientId },
          select: {
            id: true,
            name: true,
            lastName: true,
            phoneNumber: true,
            score: true,
          },
        };
        if (queryMaxLevels && queryMaxLevels > 0) {
          findOptions.take = queryMaxLevels;
        }

        const directReferrals =
          await this._prismaService.client.findMany(findOptions);

        //return directReferrals.map((ref) => this.mapToClientReferralInfo(ref));
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при поиске рефералов.', 500);
    }
  }

  async update(data: AwardBonusesDto): Promise<void> {
    try {
      const { buyerId, purchaseAmount } = data;

      if (purchaseAmount <= 0) {
        throw new HttpException(
          'Сумма покупки должна быть положительной.',
          400,
        );
      }

      const buyer = await this._prismaService.client.findUnique({
        where: { id: buyerId },
        select: { id: true, referrerId: true, name: true },
      });

      if (!buyer) {
        throw new HttpException(`Покупатель с ID ${buyerId} не найден.`, 404);
      }

      let currentReferrerId: string | null = buyer.referrerId;
      const updates = [];

      for (let level = 0; level < REFERRAL_PERCENTAGES.length; level++) {
        if (!currentReferrerId) {
          break;
        }

        const referrerToAward = await this._prismaService.client.findUnique({
          where: { id: currentReferrerId },
          select: { id: true, referrerId: true },
        });

        if (!referrerToAward) {
          break;
        }

        const bonusPercentage = REFERRAL_PERCENTAGES[level];
        const bonusAmount = Math.round(purchaseAmount * bonusPercentage);

        if (bonusAmount > 0) {
          updates.push(
            this._prismaService.client.update({
              where: { id: referrerToAward.id },
              data: { score: { increment: bonusAmount } },
            }),
          );
        }
        currentReferrerId = referrerToAward.referrerId;
      }

      if (updates.length > 0) {
        try {
          await this._prismaService.$transaction(updates);
        } catch (error) {
          console.error('Ошибка при начислении реферальных бонусов:', error);
          throw new HttpException(
            'Ошибка сервера при начислении реферальных бонусов.',
            500,
          );
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка сервера при начислении бонусов.', 500);
    }
  }

  async remove(clientId: string): Promise<ClientReferralInfo | null> {
    try {
      const client = await this._prismaService.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          lastName: true,
          phoneNumber: true,
          score: true,
          referrerId: true,
        },
      });

      if (!client) {
        throw new HttpException(`Клиент с ID ${clientId} не найден.`, 404);
      }

      if (!client.referrerId) {
        return this.mapToClientReferralInfo(client);
      }

      const updatedClient = await this._prismaService.client.update({
        where: { id: clientId },
        data: { referrerId: null },
        select: {
          id: true,
          name: true,
          lastName: true,
          phoneNumber: true,
          score: true,
        },
      });
      return this.mapToClientReferralInfo(updatedClient);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('ошибка сервера при удалении реферала', 500);
    }
  }

  private mapToClientReferralInfo(
    client: Partial<Client> & {
      id: string;
      name: string;
      lastName?: string | null;
      phoneNumber?: string | null;
      score: number | null;
    },
  ): ClientReferralInfo {
    return {
      id: client.id,
      name: client.name,
      lastName: client.lastName ?? null,
      phoneNumber: client.phoneNumber ?? '',
      score: client.score ?? 0,
    };
  }
}
