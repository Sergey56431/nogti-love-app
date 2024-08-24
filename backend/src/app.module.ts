import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [UsersModule, AuthModule, MongooseModule.forRoot('mongodb+srv://fignya2605:gDzVhUKp1WBhB7fF@cluster0.kornc6n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')],
  controllers: [],
  providers: [],
})
export class AppModule {}
