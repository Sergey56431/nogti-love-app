import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(private configService: ConfigService) {}

  // async create(user: CreateUserDto): Promise<User> {
  //   const saltRounds = 10;
  //   const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  //   const defaultPoints = parseInt(
  //     this.configService.get<string>('DEFAULT_POINTS') || '0',
  //     10,
  //   );
  //   return this.userModel.create({
  //     ...user,
  //     password: hashedPassword,
  //     points: defaultPoints,
  //     role: 'user',
  //   });
  // }
  //
  // async findOne(userFilterQuery: FilterQuery<User>): Promise<User | undefined> {
  //   return this.userModel.findOne(userFilterQuery).exec();
  // }
  //
  // async findByUsername(username: string): Promise<User | undefined> {
  //   return this.userModel.findOne({ username }).exec();
  // }
  //
  // async findById(id: string): Promise<User | undefined> {
  //   return this.userModel
  //     .findById(id)
  //     .select(['-password', '-__v', '-refreshToken'])
  //     .exec();
  // }
  //
  // async findAll(): Promise<User[]> {
  //   return this.userModel
  //     .find()
  //     .select(['-password', '-__v', '-refreshToken'])
  //     .exec();
  // }
  //
  // async update(id: string, user: UpdateUserDto): Promise<User> {
  //   return this.userModel
  //     .findByIdAndUpdate(id, user, { new: true })
  //     .select(['-password', '-__v', '-refreshToken'])
  //     .exec();
  // }
  //
  // async remove(id: string): Promise<User> {
  //   return this.userModel
  //     .findByIdAndDelete(id)
  //     .select(['-password', '-__v', '-refreshToken'])
  //     .exec();
  // }
}
