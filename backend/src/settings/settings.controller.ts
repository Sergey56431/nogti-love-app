import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TokenGuard } from '../auth';
import { CreateSettingsDto, UpdateSettingsDto } from './dto';
import { SettingsService } from './settings.service';
import { ISettingService } from './interfaces';

@UseGuards(TokenGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    @Inject(SettingsService)
    private readonly settingsServices: ISettingService,
  ) {}

  @Post()
  create(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsServices.create(createSettingsDto);
  }

  @Get()
  find(@Query('userId') userId?: string) {
    return this.settingsServices.findByUser(userId);
  }

  @Put()
  update(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Query('userId') userId: string,
  ) {
    return this.settingsServices.update(userId, updateSettingsDto);
  }

  @Delete()
  remove(@Query('userId') userId: string) {
    return this.settingsServices.remove(userId);
  }
}
