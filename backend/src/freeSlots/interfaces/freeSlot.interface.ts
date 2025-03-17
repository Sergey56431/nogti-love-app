export interface IFreeSlotsService {
  createFreeSlots(slots: { calendarId: string; time: string }[]);
  removeMany(calendarId: string);
  findFreeSlot(calendarId: string, time: string);
  findAllFreeSlots(calendarId: string);
  findUniqueSlot(calendarId: string, time: string);
  updateSlotBooking(slotId: string, isBooked: boolean);
}
