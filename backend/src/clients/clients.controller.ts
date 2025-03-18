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
import { ClientsService } from './clients.service';
import { IClientsService } from './interfaces';
import { CreateClientsDto, UpdateClientsDto } from './dto';

@UseGuards(TokenGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    @Inject(ClientsService)
    private readonly _clientsService: IClientsService,
  ) {}

  @Get()
  async find(@Query('id') id: string, @Query('masterId') masterId: string) {
    if (id) {
      return await this._clientsService.findOne(id);
    } else if (masterId) {
      return await this._clientsService.findByMaster(masterId);
    }
    return await this._clientsService.findAll();
  }

  @Post()
  async create(@Body() createClientsDto: CreateClientsDto) {
    return await this._clientsService.createClient(createClientsDto);
  }

  @Put()
  async update(@Query('id') id: string, updateClientsDto: UpdateClientsDto) {
    return await this._clientsService.updateClient(id, updateClientsDto);
  }

  @Delete()
  async remove(@Query('id') id: string) {
    return await this._clientsService.deleteClient(id);
  }
}
