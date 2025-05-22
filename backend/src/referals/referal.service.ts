import { Injectable } from '@nestjs/common';
import { IReferalService } from './interfaces';
import { PrismaService } from '../prisma';

@Injectable()
export class ReferalService implements IReferalService {
  constructor(private readonly _prismaService: PrismaService) {}
  async create() {}

  async find() {}

  async update() {}

  async remove() {}
}
