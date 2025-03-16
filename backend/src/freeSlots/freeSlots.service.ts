import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { IFreeSlotsService } from './interfaces';

@Injectable()
export class FreeSlotsService implements IFreeSlotsService{
  constructor(private readonly _prismaService: PrismaService) {}

  async createFreeSlots(slots: { calendarId: string; time: string }[]) {
    await this._prismaService.freeSlot.createMany({
      data: slots.map((slot) => ({
        ...slot,
        isBooked: false,
      })),
      skipDuplicates: true,
    });
  }

  async removeMany(calendarId: string) {
    return await this._prismaService.freeSlot.deleteMany({
      where: {
        calendarId: calendarId,
      },
    });
  }

  async findFreeSlot(calendarId: string, time: string) {
    return this._prismaService.freeSlot.findFirst({
      where: {
        calendarId,
        time,
        isBooked: false,
      },
    });
  }

  async findAllFreeSlots(calendarId: string) {
    return this._prismaService.freeSlot.findFirst({
      where: {
        calendarId,
        isBooked: false,
      },
    });
  }

  async findUniqueSlot(calendarId: string, time: string) {
    return this._prismaService.freeSlot.findUnique({
      where: {
        calendarId_time: {
          calendarId: calendarId,
          time: time,
        },
      },
    });
  }

  async updateSlotBooking(slotId: string, isBooked: boolean) {
    return this._prismaService.freeSlot.update({
      where: { id: slotId },
      data: { isBooked },
    });
  }
}
