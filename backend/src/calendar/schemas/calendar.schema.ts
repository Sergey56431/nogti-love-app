import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type CalendarDocument = Calendar1 & Document;

@Schema()
export class Calendar1 {
    id:string

    @Prop({ type: Date, required: false })
    day: Date;

    @Prop({ required: false })
    state: string;

    @Prop({ required: true })
    userId: string;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar1);