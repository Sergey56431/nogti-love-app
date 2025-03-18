import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSettingsDto, UpdateSettingsDto } from './dto';
import { ISettingService } from './interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService implements ISettingService {
  private readonly logger = new Logger(SettingsService.name);
  constructor(private _prismaService: PrismaService) {}

  public async create(createSettingsDto: CreateSettingsDto): Promise<any> {
    try {
      const settings = await this._prismaService.settings.create({
        data: {
          userId: createSettingsDto.userId,
          settingsData: createSettingsDto.settingsData as Prisma.JsonArray,
        },
      });
      this.logger.log(
        `Настройки ${createSettingsDto} успешно созданы для пользователя ${createSettingsDto.userId}`,
      );
      return settings;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Ошибка создания настроек ${createSettingsDto} для пользователя ${createSettingsDto.userId}`,
        error.stack,
      );
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async findByUser(userId: string): Promise<any> {
    try {
      const settings = await this._prismaService.settings.findFirst({
        where: { userId },
      });
      this.logger.log(`Настройки успешно получены для пользователя ${userId}`);
      return settings;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Ошибка поиска настроек для пользователя ${userId}`,
        error.stack,
      );
      throw new HttpException('Ошибка поиска настроек', 500);
    }
  }

  async update(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<any> {
    try {
      const updatedSettingsData =
        updateSettingsDto.settingsData as Prisma.JsonArray;

      const updatedSettings = await this._prismaService.settings.update({
        where: { userId },
        data: {
          settingsData: updatedSettingsData,
        },
      });
      this.logger.log(
        `Настройки успешно обновлены ${updateSettingsDto} для пользователя ${userId}`,
      );
      return updatedSettings;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(
        `Ошибка обновления настроек ${updateSettingsDto} для пользователя ${userId}`,
        error.stack,
      );
      throw new HttpException('Ошибка обновления настроек', 500);
    }
  }

  async remove(userId: string): Promise<any> {
    try {
      const deletedSettings = await this._prismaService.settings.delete({
        where: { userId },
      });
      this.logger.log(`Настройки удалены для пользователя ${userId}`);
      return deletedSettings;
    } catch (error) {
      this.logger.error(
        `Ошибка удаления настроек для пользователя ${userId}`,
        error.stack,
      );
      throw new HttpException('Ошибка удаления настроек', 500);
    }
  }
}
