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
      // @ts-ignore
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

  public async findAll(userId: string) {
    return this._prismaService.income_Expanses.findMany({
      where: {
        userId: userId,
      },
    });
  }

  public async findOne(id: number, userId: string) {
    return this._prismaService.income_Expanses.findFirst({
      where: {
        userId: userId,
        id: id,
      },
    });
  }

  public async update(
    id: number,
    userId: string,
    updateIncomExpenceDto: UpdateIncomeExpences,
  ) {
    return this._prismaService.income_Expanses.update({
      where: {
        id: id,
        userId: userId,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      data: updateIncomExpenceDto,
    });
  }

  public async remove(
    id: number,
    userId: string,
  ): Promise<CreateIncomeExpencesDto | HttpException> {
    try {
      return this._prismaService.income_Expanses.delete({
        where: {
          id: id,
          userId: userId,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
  }
}
