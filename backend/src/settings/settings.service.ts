import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSettingsDto, UpdateSettingsDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(private _prismaService: PrismaService) {}

  async create(
    createSettingsDto: CreateSettingsDto,
  ): Promise<CreateSettingsDto> {
    try {
      return await this._prismaService.settings.create({
        data: { ...createSettingsDto },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async findByUser(userId: string): Promise<CreateSettingsDto> {
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
  ): Promise<UpdateSettingsDto> {
    try {
      return await this._prismaService.settings.update({
        where: { userId },
        data: { ...updateSettingsDto },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Ошибка создания настроек', 500);
    }
  }

  async remove(userId: string): Promise<UpdateSettingsDto> {
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
