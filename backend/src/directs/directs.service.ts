import { Injectable } from '@nestjs/common';
import { CreateDirectDto, UpdateDirectDto } from './dto';

@Injectable()
export class DirectsService {
  create(createDirectDto: CreateDirectDto) {
    return 'This action adds a new direct';
  }

  findAll() {
    return `This action returns all directs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} direct`;
  }

  update(id: number, updateDirectDto: UpdateDirectDto) {
    return `This action updates a #${id} direct`;
  }

  remove(id: number) {
    return `This action removes a #${id} direct`;
  }
}
