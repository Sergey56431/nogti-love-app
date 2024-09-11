import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Calendar1, CalendarSchema} from "./schemas/calendar.schema";
import {CalendarController} from "./calendar.controller";
import {CalendarService} from "./calendar.service";
import {ArchivatedCalendar1, ArchivatedSchema} from "./schemas/archivated-calendar.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Calendar1.name, schema: CalendarSchema }]),
        MongooseModule.forFeature([{name: ArchivatedCalendar1.name, schema: ArchivatedSchema}])
    ],
    controllers: [CalendarController],
    providers: [CalendarService],
    exports: [CalendarService],
})
export class CalendarModule {}