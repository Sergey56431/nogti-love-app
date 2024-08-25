import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto} from "./dto/createUser.dto";
import {UserEntity} from "./users.entity";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {UserResponseType} from "./types/usersResponse.type";
import {compare} from 'bcrypt';
import {LoginDto} from "./dto/login.dto";
import {sign} from 'jsonwebtoken';


@Injectable()
export class UsersService {
    constructor(@InjectModel(UserEntity.name) private userModel: Model<UserEntity>) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const user = await this.userModel.findOne({username: createUserDto.username})

        if (user) {
            throw new HttpException('Имя пользователя уже используется', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const createdUser = new this.userModel(createUserDto)
        return createdUser.save()
    }

    async loginUser(loginDto: LoginDto): Promise<UserEntity> {
        const user = await this.findByUsername(loginDto.username);

        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const isPasswordCorrect = await compare(loginDto.password, user.password)

        if (!isPasswordCorrect) {
            throw new HttpException('Неверный пароль', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        return user
    }

     findByUsername(username: string) : Promise<UserEntity>{
        return this.userModel.findOne({username: username}).select('+password');
     }

    buildUserResponse(userEntity: UserEntity): UserResponseType {
        return {
            token: this.generateJwt(userEntity),
            role: userEntity.role,
            username: userEntity.username,
            points: userEntity.points
        }
    }
    generateJwt(userEntity: UserEntity): string {
        return sign({username: userEntity.username}, 'JWT_SECRET')
    }


}
