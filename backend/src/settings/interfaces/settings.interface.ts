import { CreateSettingsDto, UpdateSettingsDto } from '../dto';

export interface ISettingService {
  create(createSettingsDto: CreateSettingsDto): Promise<CreateSettingsDto>;
  findByUser(userId: string): Promise<CreateSettingsDto>;
  update(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<UpdateSettingsDto>;
  remove(userId: string): Promise<UpdateSettingsDto>;
}
