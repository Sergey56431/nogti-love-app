import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SettingItemDto {
  @IsString()
  @IsNotEmpty()
  id?: string; // Уникальный идентификатор настройки

  @IsString()
  @IsNotEmpty()
  value?: string; // Значение настройки

  // Дополнительные параметры, например:
  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class CreateSettingsDto {
  @ApiProperty({
    description: 'ID пользователя',
    nullable: false,
    example: '5592c7c4-c398-435a-9b9e-bc550139e698',
  })
  userId: string;

  @ApiProperty({
    description: 'массив объектов настрое',
    nullable: false,
    example: [{ value: 'asd' }],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settingsData?: SettingItemDto[];
}

export type UpdateSettingsDto = Partial<CreateSettingsDto>;
