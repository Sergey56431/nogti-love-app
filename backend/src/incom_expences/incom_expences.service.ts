import { HttpException, Injectable } from '@nestjs/common';
import {
  CreateOperationsDto,
  FindOperationsDto,
  UpdateOperationsDto,
} from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IOperationsService } from './interfaces';
import { CustomLogger } from '../logger';
import { Income_Expanses, Prisma } from '@prisma/client';

@Injectable()
export class OperationsService implements IOperationsService {
  private readonly _logger = new CustomLogger();
  constructor(private readonly _prismaService: PrismaService) {}

  async create(createIncomExpenceDto: CreateOperationsDto) {
    const { userId, categoryId, ...data } = createIncomExpenceDto;
    const requiredFields = ['value'];
    const errors = requiredFields
      .filter((field) => !data[field])
      .map((field) =>
        new HttpException(
          `Нет ${field === 'value' ? 'значения операции' : 'categoryId'}`,
          400,
        ).getResponse(),
      );

    if (errors.length > 0) {
      throw new HttpException({ errors, status: 400 }, 400);
    }

    try {
      const createdOperation = await this._prismaService.income_Expanses.create(
        {
          data: {
            ...data,
            user: {
              connect: { id: userId },
            },
            categoryOperations: {
              connect: { id: categoryId },
            },
          },
          include: {
            categoryOperations: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      );
      this._logger.log(`Операция успешно создана ${createdOperation}`);
      return createdOperation;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this._logger.warn(
          `Категория операции ${categoryId} или пользователь ${userId} не найден при создании операции, ${createIncomExpenceDto}`,
        );
        throw new HttpException('Категория или пользователь не найден', 404);
      }
      console.log(error);
      this._logger.error(
        `Ошибка при создании операции, ${createIncomExpenceDto}`,
        error.stack,
      );
      throw new HttpException('Ошибка при создании операции', 500);
    }
  }

  async find(filters: FindOperationsDto): Promise<Income_Expanses[]> {
    const {
      id,
      userId,
      categoryId,
      valueMin,
      valueMax,
      dateFrom,
      dateTo,
      type,
    } = filters;
    const where: Prisma.Income_ExpansesWhereInput = {};

    if (id) {
      where.id = id;
    }
    if (userId) {
      where.userId = userId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (valueMin !== undefined || valueMax !== undefined) {
      where.value = {};
      if (valueMin !== undefined) {
        where.value.gte = parseFloat(valueMin.toString());
      }
      if (valueMax !== undefined) {
        where.value.lte = parseFloat(valueMax.toString());
      }
    }
    if (dateFrom || dateTo) {
      where.createDate = {};
      if (dateFrom) {
        where.createDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setUTCHours(23, 59, 59, 999);
        where.createDate.lte = endDate;
      }
    }
    if (type) {
      where.categoryOperations = {
        type: type,
      };
    }

    try {
      const operations = await this._prismaService.income_Expanses.findMany({
        where,
        include: {
          categoryOperations: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      if (id && operations.length === 0) {
        this._logger.warn(`Операция с ID ${id} не найдена`);
        throw new HttpException('Операция не найдена', 404);
      }

      this._logger.log(
        `Операции найдены по фильтрам: ${JSON.stringify(filters)}. Найдено: ${operations.length}`,
      );
      return operations;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      this._logger.error(
        `Ошибка при поиске операций по фильтрам ${JSON.stringify(filters)}`,
        error.stack,
      );
      throw new HttpException('Ошибка при поиске операций', 500);
    }
  }

  async update(id: string, updateOperationDto: UpdateOperationsDto) {
    try {
      const dataToUpdate: Prisma.Income_ExpansesUpdateInput = {};

      if (updateOperationDto.value !== undefined) {
        dataToUpdate.value = updateOperationDto.value;
      }
      if (updateOperationDto.categoryId) {
        dataToUpdate.categoryOperations = {
          connect: { id: updateOperationDto.categoryId },
        };
      }

      if (updateOperationDto.userId) {
        dataToUpdate.user = {
          connect: { id: updateOperationDto.userId },
        };
      }

      if (Object.keys(dataToUpdate).length === 0) {
        this._logger.warn(`Нет данных для обновления операции с ID ${id}`);

        const currentOperation =
          await this._prismaService.income_Expanses.findUnique({
            where: { id },
          });
        if (!currentOperation) {
          throw new HttpException('Операция не найдена для обновления', 404);
        }
        return currentOperation;
      }

      dataToUpdate.updateDate = new Date();

      const result = await this._prismaService.income_Expanses.update({
        where: { id },
        data: dataToUpdate,
      });
      this._logger.log(
        `Операция с ID ${id} успешно обновлена: ${JSON.stringify(result)}`,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        (error.code === 'P2025' || error.code === 'P2016')
      ) {
        this._logger.warn(
          `Операция с ID ${id} или связанная категория не найдена при обновлении, ${JSON.stringify(updateOperationDto)}`,
          error.message,
        );
        throw new HttpException(
          'Операция или связанная категория не найдена',
          404,
        );
      }
      console.error(error);
      this._logger.error(
        `Ошибка при обновлении операции с ID ${id}, ${JSON.stringify(updateOperationDto)}`,
        error.stack,
      );
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
        this._logger.warn(`Операция с ID ${id} не найдена при удалении`);
        throw new HttpException('Операция не найдена', 404);
      }
      console.log(error);
      this._logger.error(
        `Ошибка при удалении операции с ID ${id}`,
        error.stack,
      );
      throw new HttpException('Ошибка при удалении операции', 500);
    }
  }
}
