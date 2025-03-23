import { HttpException, Injectable, Logger } from '@nestjs/common';
import { IClientsService } from './interfaces';
import { PrismaService } from '../prisma';
import { CreateClientsDto, UpdateClientsDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ClientsService implements IClientsService {
  private readonly logger = new Logger(ClientsService.name);
  constructor(private readonly _prismaService: PrismaService) {}

  private _returnClientModel = {
    id: true,
    name: true,
    lastName: true,
    phoneNumber: true,
    score: true,
    rate: true,
    birthday: true,
    description: true,
    refreshToken: false,
    password: false,
    masterId: true,
    roleId: true,
  };

  public async findAll() {
    try {
      return await this._prismaService.client.findMany({
        select: this._returnClientModel,
      });
    } catch (error) {
      console.error(error);
      this.logger.error('Ошибка при получении списка клиентов', error.stack);
      throw new HttpException(
        'Ошибка сервера при получении списка клиентов',
        500,
      );
    }
  }

  public async findByMaster(masterId: string) {
    try {
      return await this._prismaService.client.findMany({
        where: { masterId },
        select: this._returnClientModel,
      });
    } catch (error) {
      console.error(error);
      this.logger.error(
        `Ошибка при поиске клиента по ID мастера ${masterId}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при поиске клиента', 500);
    }
  }

  public async findOne(id: string) {
    try {
      const result = await this._prismaService.client.findUnique({
        select: this._returnClientModel,
        where: { id },
      });

      if (!result) {
        this.logger.warn(`Клиент с ID ${id} не найден`);
        throw new HttpException('Клиент не найден', 404);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      this.logger.error(`Ошибка при поиске клиента по ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при поиске клиента по ID', 500);
    }
  }

  public async createClient(createClientsDto: CreateClientsDto) {
    const { password, phoneNumber } = createClientsDto;
    if (!password || !phoneNumber) {
      this.logger.warn(
        `Отсутствуют необходимые данные ${createClientsDto} для создания клиента`,
      );
      throw new HttpException(
        `Отсутствуют необходимые данные для создания клиента`,
        400,
      );
    }

    const existingClient = await this._prismaService.client.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingClient) {
      this.logger.warn(
        `Клиент с таким phoneNumber ${createClientsDto} уже существует`,
      );
      throw new HttpException('Клиент с таким phoneNumber уже существует', 409);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      if (createClientsDto.birthday) {
        createClientsDto.birthday = new Date(createClientsDto.birthday);
      }
      const client = await this._prismaService.client.create({
        select: this._returnClientModel,
        data: { ...createClientsDto, password: hashedPassword },
      });

      this.logger.log(`Клиент успешно создан, \n${createClientsDto}`);

      return client;
    } catch (error) {
      if (error.code === 'P2002') {
        this.logger.warn(
          `Клиент с таким именем уже существует ${createClientsDto}`,
        );
        throw new HttpException('Клиент с таким именем уже существует', 409);
      }
      console.error(error);
      this.logger.error(
        `Ошибка при создании клиента ${createClientsDto}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при создании клиента', 500);
    }
  }

  public async updateClient(id: string, data: UpdateClientsDto) {
    if (!id) {
      this.logger.warn(`Отсутствует ID клиента ${data}`);
      throw new HttpException('Отсутствует ID клиента', 400);
    }
    try {
      return await this._prismaService.client.update({
        select: this._returnClientModel,
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Клиент с ID ${id} не найден ${data}`);
        throw new HttpException('Клиент не найден', 404);
      }
      console.error(error);
      this.logger.error(
        `Ошибка при обновлении клиента с ID ${id} ${data}`,
        error.stack,
      );
      throw new HttpException('Ошибка сервера при обновлении клиента', 500);
    }
  }

  public async deleteClient(id: string) {
    try {
      return await this._prismaService.client.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Клиент с ID ${id} не найден при удалении`);
        throw new HttpException('Клиент не найден', 404);
      }
      console.error(error);
      this.logger.error(`Ошибка при удалении клиента с ID ${id}`, error.stack);
      throw new HttpException('Ошибка сервера при удалении клиента', 500);
    }
  }
}
