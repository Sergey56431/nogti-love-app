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
      this.logger.log(`Настройки успешно созданы для пользователя ${createSettingsDto.userId}`);
      return settings;
    } catch (error) {
      console.log(error);
      this.logger.error(`Ошибка создания настроек для пользователя ${createSettingsDto.userId}`, error.stack);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async findByUser(userId: string): Promise<CreateSettingsDto> {
    try {
      const settings = await this._prismaService.settings.findFirst({
        where: { userId },
      });
      if (!settings) {
        this.logger.warn(`Настройки для пользователя ${userId} не найдены`);
        throw new HttpException('Настройки не найдены', 404);
      }
      this.logger.log(`Настройки успешно получены для пользователя ${userId}`);
      return settings;
    } catch (error) {
      console.log(error);
      this.logger.error(`Ошибка поиска настроек для пользователя ${userId}`, error.stack);
      throw new HttpException('Ошибка поиска настроек', 500);
    }
  }

  async update(userId: string, updateSettingsDto: UpdateSettingsDto): Promise<UpdateSettingsDto> {
    try {
      const updatedSettings = await this._prismaService.settings.update({
        where: { userId },
        data: { ...updateSettingsDto },
      });
      this.logger.log(`Настройки успешно создны для пользователя ${userId}`);
      return updatedSettings;
    } catch (error) {
      console.log(error);
      this.logger.error(`Ошибка создания настроек для пользователя ${userId}`, error.stack);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async remove(userId: string): Promise<UpdateSettingsDto> {
    try {
      const deletedSettings = await this._prismaService.settings.delete({
        where: { userId },
      });
      this.logger.log(`Настройки удалены для пользователя ${userId}`);
      return deletedSettings;
    } catch (error) {
      this.logger.error(`Ошибка удаления настроек для пользователя ${userId}`, error.stack);
      throw new HttpException('Ошибка удаления настроек', 500);
    }
  }
}
