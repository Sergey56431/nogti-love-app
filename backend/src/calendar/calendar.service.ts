import {HttpException, Injectable} from '@nestjs/common';
import {CreateCalendarDto, UpdateCalendarDto} from './dto';
import {PrismaService} from '../prisma';
import {DayState} from "@prisma/client";

@Injectable()
export class CalendarService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async create(data: { body: CreateCalendarDto; userId: string }) {
    return this._prismaService.calendar.create({
      data: {
        date: new Date(data.body.date),
        state: data.body.state,
        creator: {
          connect: {
            id: data.userId.toString(),
          },
        },
      },
      include: {
        directs: true,
      },
    });
  }

  public async create_all (data) {
      const { noWorkDays, userId } = data;
      const now = new Date();

      const firstDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const lastDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));

      const daysMap = new Map<string, { state: DayState; userId: string }>();

      for (let date = new Date(firstDayOfMonth); date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
          const dateString = date.toISOString().slice(0, 10); // Используем строку для ключа Map
          daysMap.set(dateString, { state: DayState.empty, userId });
      }

      for (const { date: dateString } of noWorkDays) {
          if (daysMap.has(dateString)) {
              daysMap.get(dateString)!.state = DayState.notHave;
          } else {
              throw new HttpException(`Дата ${dateString} не находится в текущем месяце`, 404);
          }
      }

      try {
          const daysToCreate = [...daysMap.entries()].map(([dateString, { state, userId }]) => ({
              date: new Date(dateString),
              state,
              userId,
          }));

          return await this._prismaService.$transaction(
              daysToCreate.map((day) =>
                  this._prismaService.calendar.upsert({
                      where: {
                          date: day.date,
                          userId: day.userId,
                      },
                      update: { state: day.state },
                      create: { date: day.date, state: day.state, userId: day.userId },
                  })
              )
          );
      } catch (error) {
          console.error("Ошибка при создании календаря:", error);
          throw new HttpException("Ошибка при создании календаря", 500);
      }
  }

  public async findAll() {
    return this._prismaService.calendar.findMany({
      include: {
        directs: true,
      },
    });
  }

  public async findByUser(userId: string){
    return this._prismaService.calendar.findMany({
      where:{ userId: userId },
      include: {
        directs: true,
      },
    })
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
      data: {
        date: new Date(updateCalendarDto.date),
        state: updateCalendarDto.state,
      },
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
