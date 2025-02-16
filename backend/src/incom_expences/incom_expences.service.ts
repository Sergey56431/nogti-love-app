import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIncomeExpencesDto, UpdateIncomeExpences } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class IncomExpencesService {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(createIncomExpenceDto: CreateIncomeExpencesDto, userId: string) {
    try {
      const errors = [];
      if (!createIncomExpenceDto.type) {
        errors.push(new HttpException('Нет типа операции', 400).getResponse());
      }
      if (!createIncomExpenceDto.value) {
        errors.push(
          new HttpException('Нет значения операции', 400).getResponse(),
        );
      }
      if (!createIncomExpenceDto.category) {
        errors.push(
          new HttpException('Нет категории операции', 400).getResponse(),
        );
      }
      if (errors[0]) {
        throw new HttpException({ errors, status: 400 }, 400);
      }
      return this._prismaService.income_Expanses.create({
        data: {
          ...createIncomExpenceDto,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException('Ошибка при создании операции', 500);
    }
  }

  async findByUser(userId: string) {
    try {
      const result = await this._prismaService.income_Expanses.findMany({
        where: {
          userId: userId,
        },
      });
      if (!result[0]) {
        throw new HttpException('Операции или пользователь не найдены', 404);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new HttpException(
        'Ошибка при поиске категорий по пользователю',
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
        throw new HttpException('Категория не найдена', 404);
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

  async update(id: string, updateIncomExpenceDto: UpdateIncomeExpences) {
    try {
      const errors = [];
      if (!updateIncomExpenceDto.type) {
        errors.push(new HttpException('Нет типа операции', 400).getResponse());
      }
      if (!updateIncomExpenceDto.value) {
        errors.push(
          new HttpException('Нет значения операции', 400).getResponse(),
        );
      }
      if (!updateIncomExpenceDto.category) {
        errors.push(
          new HttpException('Нет категории операции', 400).getResponse(),
        );
      }
      if (errors[0]) {
        throw new HttpException({ errors, status: 400 }, 400);
      }
      const result = await this._prismaService.income_Expanses.update({
        where: {
          id: id,
        },
        data: updateIncomExpenceDto,
      });
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Операция не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка при обновлении операции', 500);
    }
  }

  async remove(id: string): Promise<CreateIncomeExpencesDto | HttpException> {
    try {
      const result = await this._prismaService.income_Expanses.delete({
        where: {
          id: id,
        },
      });
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      ) {
        throw new HttpException('Операция не найдена', 404);
      }
      console.log(error);
      throw new HttpException('Ошибка при удалении операции', 500);
    }
  }
}
