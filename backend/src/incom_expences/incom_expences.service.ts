import { HttpException, Injectable } from '@nestjs/common';
import { CreateOperationsDto, UpdateOperationsDto } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IOperationsService } from './interfaces';

@Injectable()
export class OperationsService implements IOperationsService {
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
      return await this._prismaService.income_Expanses.create({
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
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new HttpException('Категория или пользователь не найден', 404);
      }
      console.error(error);
      throw new HttpException('Ошибка при создании операции', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      return await this._prismaService.income_Expanses.findMany({
        where: {
          userId: userId,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException(
        'Ошибка при поиске операций по пользователю',
        500,
      );
    }
  }

  async findAll() {
    try {
      return await this._prismaService.income_Expanses.findMany();
    } catch (error) {
      console.log(error);
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
        throw new HttpException('Операция не найдена', 404);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
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
        throw new HttpException('Операция не найдена', 404);
      }
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
        throw new HttpException('Операция не найдена', 404);
      }
      console.error(error);
      throw new HttpException('Ошибка при удалении операции', 500);
    }
  }
}
