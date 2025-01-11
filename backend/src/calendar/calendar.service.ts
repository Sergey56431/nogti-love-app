import { Injectable } from '@nestjs/common';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { PrismaService } from '../prisma';

@Injectable()
export class CalendarService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async create(data: { body: CreateCalendarDto; userId: string }) {
    return this._prismaService.calendar.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      data: {
        ...data.body,
        creator: {
          connect: {
            id: data.userId,
          },
        },
      },
      include: {
        directs: true,
      },
    });
  }

  public async findAll() {
    return this._prismaService.calendar.findMany({
      include: {
        directs: true,
      },
    });
  }

  public async findOne(id: string) {
    return this._prismaService.calendar.findFirst({
      where: {
        id,
      },
      include: {
        directs: true,
      },
    });
  }

  public async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    return this._prismaService.calendar.update({
      where: {
        id,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      data: updateCalendarDto,
    });
  }

  public async remove(id: string) {
    return this._prismaService.calendar.delete({
      where: {
        id,
      },
    });
  }
}
