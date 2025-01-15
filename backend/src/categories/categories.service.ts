import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {CreateCategoryDto, UpdateCategoryDto} from "./dto";


@Injectable()
export class CategoryService {
    constructor(private _prismaService: PrismaService) {}

    async create(data: CreateCategoryDto) {
        return this._prismaService.category.create({
            data:{
                name: data.name,
                userId: data.userId
            },
            include: {
                services: true,
            },
        });
    }

    async findAll() {
        return this._prismaService.category.findMany();
    }

    async findOne(id: string) {
        return this._prismaService.category.findUnique({ where: { id } });
    }

    async findByUser(userId: string) {
        return this._prismaService.category.findMany({ where:{ userId } });
    }

    async update(id: string, data: UpdateCategoryDto) {
        return this._prismaService.category.update({
            where: { id },
            data:{
                name: data.name,
                userId: data.userId
            },
            include: {
                services: true,
            },
        });
    }

    async remove(id: string) {
        return this._prismaService.category.delete({ where: { id } });
    }
}