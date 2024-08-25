import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UserEntity, UserEntitySchema} from "./users.entity";
@Module({
    imports: [MongooseModule.forFeature([{name: UserEntity.name, schema: UserEntitySchema}])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}