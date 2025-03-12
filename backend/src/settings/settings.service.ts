import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSettingsDto, UpdateSettingsDto } from './dto';
import { CustomLogger } from '../logger';

@Injectable()
export class SettingsService {
  private readonly logger = new CustomLogger();

  constructor(private _prismaService: PrismaService) {}

  async create(createSettingsDto: CreateSettingsDto): Promise<CreateSettingsDto> {
    try {
      const settings = await this._prismaService.settings.create({
        data: { ...createSettingsDto },
      });

      this.logger.log(`Настройки для пользователя ${createSettingsDto.userId} успешно созданы`);
      return settings;
    } catch (error) {
      this.logger.error('Ошибка при создании настроек', error.stack);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async find(userId: string): Promise<CreateSettingsDto> {
    try {
      const settings = await this._prismaService.settings.findFirst({
        where: { userId },
      });

      if (!settings) {
        this.logger.warn(`Настройки для пользователя с ID ${userId} не найдены`);
        throw new HttpException('Настройки не найдены', 404);
      }

      this.logger.log(`Настройки для пользователя с ID ${userId} успешно найдены`);
      return settings;
    } catch (error) {
      this.logger.error(`Ошибка при поиске настроек для пользователя с ID ${userId}`, error.stack);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async update(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<UpdateSettingsDto> {
    try {
      const updatedSettings = await this._prismaService.settings.update({
        where: { userId },
        data: { ...updateSettingsDto },
      });

      this.logger.log(`Настройки для пользователя с ID ${userId} успешно обновлены`);
      return updatedSettings;
    } catch (error) {
      this.logger.error(`Ошибка при обновлении настроек для пользователя с ID ${userId}`, error.stack);
      throw new HttpException('Ошибка обновления настроек', 500);
    }
  }

  async remove(userId: string): Promise<UpdateSettingsDto> {
    try {
      const deletedSettings = await this._prismaService.settings.delete({
        where: { userId },
      });

      this.logger.log(`Настройки для пользователя с ID ${userId} успешно удалены`);
      return deletedSettings;
    } catch (error) {
      this.logger.error(`Ошибка при удалении настроек для пользователя с ID ${userId}`, error.stack);
      throw new HttpException('Ошибка удаления настроек', 500);
    }
  }
}
