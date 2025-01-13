import {Injectable} from '@nestjs/common';
import {CreateDirectDto, UpdateDirectDto} from './dto';
import {PrismaService} from "../prisma";


@Injectable()
export class DirectsService {
  constructor(private readonly _prismaService: PrismaService) {}

  public async findByDate(date: string) {
    try {
      return await this._prismaService.directs.findMany({
        where: {
          calendar: {
            date: new Date(date),
          },
        },
      });
    } catch (error) {
      console.error('Ошибка при поиске по дате:', error);
      throw new Error('Ошибка при поиске данных');
    }
  }

  public async create(createDirectDto: CreateDirectDto) {
    try {
      //Важная проверка на корректность даты
      const date = new Date(createDirectDto.date);
      if (isNaN(date.getTime())) {
        throw new Error(`Некорректная дата: ${createDirectDto.date}`);
      }


      let calendar;
      try{
        calendar = await this._prismaService.calendar.findFirst({
          where: { date },
        });
      }
      catch(error){
        console.error("Ошибка поиска календаря:", error);
        throw new Error("Ошибка при поиске календаря");
      }

      if (!calendar) {
        try{
          /*calendar = await this._prismaService.calendar.create({
            data: {
              date: date
            }
          });*/
        } catch (error) {
          console.error("Ошибка при создании календаря:", error);
          throw new Error("Ошибка при создании календаря"); // Перебрасываем ошибку
        }
      }
      console.log({data: {
          ...createDirectDto,
          calendarId: calendar.id,

        }})
      const newDirect = await this._prismaService.directs.create({
        data: {
          phone: createDirectDto.phone,
          clientName: createDirectDto.name,
          time: createDirectDto.time,
          comment: createDirectDto.comment,
          calendarId: calendar.id,
        }
      });

      return newDirect;
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
      throw new Error('Ошибка при создании данных');
    }
  }

  public async findAll(id: string) {   // Подлежит переработке для оптимизации
    try {
      const userPhone = await this._prismaService.user.findMany({
        where: {id},
        select: { phoneNumber:true }
      });
      return await this._prismaService.directs.findMany({
        where: {phone: userPhone[0].phoneNumber}
      })

    } catch (error) {
      console.error('Ошибка при получении всех записей:', error);
      throw new Error('Ошибка при получении данных');
    }
  }

  public async findOne(id: number) {
    try {
      return await this._prismaService.directs.findUnique({
        where: { id: +id },
      });
    } catch (error) {
      console.error('Ошибка при поиске записи:', error);
      throw new Error('Ошибка при поиске данных');
    }
  }

  public async update(id: number, updateDirectDto: UpdateDirectDto) {
    try {
      const calendarId = await this._prismaService.calendar.findUnique({
        where:{date: new Date(updateDirectDto.date)},
        select:{id:true}
      });

      return await this._prismaService.directs.update({
        where: { id:+id },
        data: {
          phone: updateDirectDto.phone,
          clientName: updateDirectDto.name,
          time: updateDirectDto.time,
          comment: updateDirectDto.comment,
          calendarId: calendarId.id,
        },
      });
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
      throw new Error('Ошибка при обновлении данных');
    }
  }

  public async remove(id: number) {
    try {
      await this._prismaService.directs.delete({
        where: {id: +id},
      });
      return true
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
      throw new Error('Ошибка при удалении данных');
    }
  }
}