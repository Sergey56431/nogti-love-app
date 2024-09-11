import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Calendar1, CalendarDocument} from "./schemas/calendar.schema";
import {UpdateCalendarDto} from "./dto/update-calendar.dto";
import {ArchivatedCalendar1, ArchivatedCalendarDocument} from "./schemas/archivated-calendar.schema";
import {ArchiveNotFoundException, CalendarNotFoundException} from "../custom-exceptions/custom-exceptions";

@Injectable()
export class CalendarService {
    constructor(
        @InjectModel(Calendar1.name)
        private calendarModel: Model<CalendarDocument>,
        @InjectModel(ArchivatedCalendar1.name)
        private archivatedCalendarModel: Model<ArchivatedCalendarDocument>,
    ) {}

    async create(id: string): Promise<Calendar1[]> {

        const d = new Date();

        let days = [];
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

        for (let day = 2; day <= lastDay+1; day++) {

            days.push(new Date(new Date().getFullYear(), new Date().getMonth(), +day));
            await this.calendarModel.create({
                userId: id,
                day: new Date(new Date().getFullYear(), new Date().getMonth(), +day),
                state: 'Рабочий день'
            })
        }

        return this.calendarModel.find({userId: id}).select(['-__v']);
    }

    async update(id: string, updateDto: UpdateCalendarDto): Promise<UpdateCalendarDto> {
        return this.calendarModel.findByIdAndUpdate(id, updateDto).select(['-__v']);
    }

    async findById(id: string): Promise<Calendar1[]> {
        const days = <Calendar1[]> await this.calendarModel.find({userId: id}).select('-__v').exec();
        const date = new Date()

        if (days.length === 0) {
            throw new CalendarNotFoundException()
        }

        if (days[0].day.getMonth() > date.getMonth() || days[0].day.getFullYear() > date.getFullYear()) {
            await this.archivate(id);
        }

        return this.calendarModel.find({userId: id}).select('-__v');
    }

    async clearAll(id: string){
        return this.calendarModel.deleteMany({userId:id}).select('-acknowledged');
    }

    async archivate(id: string): Promise<Calendar1[]> {
        const calendar = <Calendar1[]> await this.calendarModel.find({userId: id}).select(['-_id','-__v']).exec();
        for (let i = 0; i < calendar.length; i++) {
            await this.archivatedCalendarModel.create({day: calendar[i].day, state: calendar[i].state, userId: calendar[i].userId})
        }
        await this.clearAll(id);
        return await this.create(id);
    }

    async clearAllArchive(id: string) {
        return this.archivatedCalendarModel.deleteMany({userId: id}).select('-acknowledged');
    }

    async findArchivatedById(id: string): Promise<ArchivatedCalendar1[]> {
        const archive = <ArchivatedCalendar1[]> await this.archivatedCalendarModel.find({userId: id}).select('-__v').exec();
        if (archive.length === 0){
            throw new ArchiveNotFoundException();
        }
        return archive;
    }

}