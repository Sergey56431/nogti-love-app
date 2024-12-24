import { Injectable } from '@nestjs/common';
import { CreateDirectDto, UpdateDirectDto } from './dto';

@Injectable()
export class DirectsService {
  public async create(createDirectDto: CreateDirectDto) {
    return 'This action adds a new direct';
  }

  public async findAll() {
    return `This action returns all directs`;
  }

  public async findOne(id: number) {
    return `This action returns a #${id} direct`;
  }

  public async update(id: number, updateDirectDto: UpdateDirectDto) {
    return `This action updates a #${id} direct`;
  }

  public async remove(id: number) {
    return `This action removes a #${id} direct`;
  }
}
