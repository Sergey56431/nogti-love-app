import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArchivatedCalendarDocument = ArchivatedCalendar1 & Document;

@Schema()
export class ArchivatedCalendar1 {
  id: string;

  @Prop({ type: Date, required: false, unique: false })
  day: Date;

  @Prop({ required: false, unique: false })
  state: string;

  @Prop({ required: true, unique: false })
  userId: string;
}

export const ArchivatedSchema =
  SchemaFactory.createForClass(ArchivatedCalendar1);
