import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSettingsDto, UpdateSettingsDto } from './dto';
import { ISettingService } from './interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService implements ISettingService {
  constructor(private _prismaService: PrismaService) {}

  public async create(createSettingsDto: CreateSettingsDto): Promise<any> {
    try {
      return await this._prismaService.settings.create({
        data: {
          userId: createSettingsDto.userId,
          settingsData: createSettingsDto.settingsData as Prisma.JsonArray,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async findByUser(userId: string): Promise<any> {
    try {
      return await this._prismaService.settings.findFirst({
        where: { userId },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async update(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<any> {
    try {
      const updatedSettingsData =
        updateSettingsDto.settingsData as Prisma.JsonArray;

      return await this._prismaService.settings.update({
        where: { userId },
        data: {
          settingsData: updatedSettingsData,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка обновления настроек', 500);
    }
  }

  async remove(userId: string): Promise<any> {
    try {
      return await this._prismaService.settings.delete({
        where: { userId },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }
}
