import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateOperationsDto, UpdateOperationsDto } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IOperationsService } from './interfaces';

@Injectable()
export class OperationsService implements IOperationsService {
  private readonly logger = new Logger(OperationsService.name);
  constructor(private readonly _prismaService: PrismaService) {}

  async create(createIncomExpenceDto: CreateOperationsDto) {
    const { userId, categoryId, ...data } = createIncomExpenceDto;
    const requiredFields = ['type', 'value'];
    const errors = requiredFields
      .filter((field) => !data[field])
      .map((field) =>
        new HttpException(
          `Нет ${field === 'value' ? 'значения операции' : field === 'type' ? 'типа операции' : 'categoryId'}`,
          400,
        ).getResponse(),
      );

    if (errors.length > 0) {
      throw new HttpException({ errors, status: 400 }, 400);
    }

    try {
      const createdOperation = await this._prismaService.income_Expanses.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
          categoryOperations: {
            connect: { id: categoryId },
          },
        },
      });
      this.logger.log(`Операция успешно создана ${createdOperation}`);
      return createdOperation;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Категория операции ${categoryId} или пользователь ${userId} не найден при создании операции, ${createIncomExpenceDto}`);
        throw new HttpException('Категория или пользователь не найден', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при создании операции, ${createIncomExpenceDto}`, error.stack);
      throw new HttpException('Ошибка при создании операции', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      const operations = await this._prismaService.income_Expanses.findMany({
        where: { userId },
      });
      this.logger.log(`Операции пользователя с ID ${userId} успешно найдены`);
      return operations;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(`Ошибка при поиске операций по пользователю ${userId}`, error.stack);
      throw new HttpException(
        'Ошибка при поиске операций по пользователю',
        500,
      );
    }
  }

  async findAll() {
    try {
      const operations = await this._prismaService.income_Expanses.findMany();
      this.logger.log(`Все операции успешно получены`);
      return operations;
    } catch (error) {
      console.log(error);
      this.logger.error('Ошибка при поиске всех операций', error.stack);
      throw new HttpException('Ошибка при поиске всех операций', 500);
    }
  }

  async findOne(id: string) {
    try {
      const result = await this._prismaService.income_Expanses.findFirst({
        where: {
          id,
        },
      });
      if (!result) {
        this.logger.warn(`Операция с ID ${id} не найдена`);
        throw new HttpException('Операция не найдена', 404);
      }
      this.logger.log(`Операция с ID ${id} успешно найдена`);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this.logger.error(`Ошибка при поиске операции с ID ${id}`, error.stack);
      throw new HttpException('Ошибка при поиске операции', 500);
    }
  }

  async update(id: string, updateIncomExpenceDto: UpdateOperationsDto) {
    try {
      const data: UpdateOperationsDto = {};

      if (updateIncomExpenceDto.categoryId) {
        data.categoryId = updateIncomExpenceDto.categoryId;
      }
      if (updateIncomExpenceDto.value) {
        data.value = updateIncomExpenceDto.value;
      }
      if (updateIncomExpenceDto.type) {
        data.type = updateIncomExpenceDto.type;
      }

      const result = await this._prismaService.income_Expanses.update({
        where: { id },
        data,
      });
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Операция с ID ${id} не найдена при обновлении, \n ${updateIncomExpenceDto}`);
        throw new HttpException('Операция не найдена', 404);
      }
      console.error(error);
      this.logger.error(`Ошибка при обновлении операции с ID ${id}, \n ${updateIncomExpenceDto}`, error.stack);
      throw new HttpException('Ошибка при обновлении операции', 500);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this._prismaService.income_Expanses.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.warn(`Операция с ID ${id} не найдена при удалении`);
        throw new HttpException('Операция не найдена', 404);
      }
      console.log(error);
      this.logger.error(`Ошибка при удалении операции с ID ${id}`, error.stack);
      throw new HttpException('Ошибка при удалении операции', 500);
    }
  }
}
