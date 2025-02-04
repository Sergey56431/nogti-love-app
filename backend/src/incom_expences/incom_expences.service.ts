import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateIncomeExpencesDto,
  UpdateIncomeExpences,
} from './dto/create-incom_expence.dto';
import { PrismaService } from '../prisma';

@Injectable()
export class IncomExpencesService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async create(
    createIncomExpenceDto: CreateIncomeExpencesDto,
    userId: string,
  ) {
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
  }

  public async findByUser(userId: string) {
    return this._prismaService.income_Expanses.findMany({
      where: {
        userId: userId,
      },
    });
  }

  public async findAll() {
    return this._prismaService.income_Expanses.findMany();
  }

  public async findOne(id: string) {
    return this._prismaService.income_Expanses.findFirst({
      where: {
        id: id,
      },
    });
  }

  public async update(
    id: string,
    updateIncomExpenceDto: UpdateIncomeExpences,
  ) {
    return this._prismaService.income_Expanses.update({
      where: {
        id: id,
      },
      data: updateIncomExpenceDto,
    });
  }

  public async remove(
    id: string,
  ): Promise<CreateIncomeExpencesDto | HttpException> {
    try {
      return this._prismaService.income_Expanses.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
}
