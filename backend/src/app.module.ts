import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import cookieParser from "cookie-parser";
import {CalendarModule} from "./calendar/calendar.module";

@Module({
    imports: [
        UsersModule,
        AuthModule,
        CalendarModule,
        MongooseModule.forRoot(
            'mongodb+srv://fignya2605:260520Zz_@cluster0.kornc6n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        ),
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
