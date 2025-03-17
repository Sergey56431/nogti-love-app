import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServicesDto, UpdateServicesDto } from './dto';
import { TokenGuard } from '../auth';
import { IServicesService } from './interfaces';

@UseGuards(TokenGuard)
@Controller('services')
export class ServicesController {
  constructor(
    @Inject(ServicesService)
    private readonly servicesService: IServicesService,
  ) {}

  @Post()
  create(@Body() createServicesDto: CreateServicesDto) {
    return this.servicesService.create(createServicesDto);
  }

  @Get()
  find(@Query('categoryId') categoryId?: string, @Query('id') id?: string) {
    if (categoryId) {
      return this.servicesService.findByCategory(categoryId);
    } else if (id) {
      return this.servicesService.findOne(id);
    } else {
      return this.servicesService.findAll();
    }
  }

  @Put()
  update(
    @Body() updateServicesDto: UpdateServicesDto,
    @Query('id') id: string,
  ) {
    return this.servicesService.update(id, updateServicesDto);
  }

  @Delete()
  remove(@Query('id') id: string) {
    return this.servicesService.remove(id);
  }
}
