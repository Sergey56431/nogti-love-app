import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateIncomeExpencesDto, UpdateIncomeExpences } from './dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomLogger } from '../logger';

@Injectable()
export class IncomExpencesService {
  private readonly logger = new CustomLogger();

  constructor(private readonly _prismaService: PrismaService) {}

  async create(createIncomExpenceDto: CreateIncomeExpencesDto) {
    const { userId, categoryId, ...data } = createIncomExpenceDto;
    const requiredFields = ['type', 'value'];
    const missingField = requiredFields.find((field) => !data[field]);

    if (missingField) {
      this.logger.warn(`Отсутствует обязательное поле: ${missingField}`);
      throw new HttpException(`Нет ${missingField === 'value' ? 'значения операции' : missingField === 'type' ? 'типа операции' : 'categoryId'}`, 400);
    }

    try {
      const result = await this._prismaService.income_Expanses.create({
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
      this.logger.log(`Операция с ID ${result.id} успешно создана`);
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn('Категория или пользователь не найдены');
        throw new NotFoundException('Категория или пользователь не найдены');
      }
      this.logger.error('Ошибка при создании операции', error.stack);
      throw new InternalServerErrorException('Ошибка при создании операции');
    }
  }

  async findByUser(userId: string) {
    try {
      const result = await this._prismaService.income_Expanses.findMany({
        where: { userId },
      });
      this.logger.log(`Операции для пользователя с ID ${userId} успешно найдены`);
      return result;
    } catch (error) {
      this.logger.error('Ошибка при поиске операций по пользователю', error.stack);
      throw new InternalServerErrorException('Ошибка при поиске операций по пользователю');
    }
  }

  async findAll() {
    try {
      const result = await this._prismaService.income_Expanses.findMany();
      this.logger.log('Все операции успешно найдены');
      return result;
    } catch (error) {
      this.logger.error('Ошибка при поиске всех операций', error.stack);
      throw new InternalServerErrorException('Ошибка при поиске всех операций');
    }
  }

  async findOne(id: string) {
    try {
      const result = await this._prismaService.income_Expanses.findFirst({
        where: { id },
      });
      if (!result) {
        this.logger.warn(`Операция с ID ${id} не найдена`);
        throw new NotFoundException('Операция не найдена');
      }
      this.logger.log(`Операция с ID ${id} успешно найдена`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Ошибка при поиске операции', error.stack);
      throw new InternalServerErrorException('Ошибка при поиске операции');
    }
  }

  async update(id: string, updateIncomExpenceDto: UpdateIncomeExpences) {
    try {
      const data: UpdateIncomeExpences = {};

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

      this.logger.log(`Операция с ID ${id} успешно обновлена`);
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`Операция с ID ${id} не найдена`);
        throw new NotFoundException('Операция не найдена');
      }
      this.logger.error(`Ошибка при обновлении операции с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка при обновлении операции');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this._prismaService.income_Expanses.delete({
        where: { id },
      });
      this.logger.log(`Операция с ID ${id} успешно удалена`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`Операция с ID ${id} не найдена`);
        throw new NotFoundException('Операция не найдена');
      }
      this.logger.error(`Ошибка при удалении операции с ID ${id}`, error.stack);
      throw new InternalServerErrorException('Ошибка при удалении операции');
    }
  }
}
