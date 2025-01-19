import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {CreateServicesDto, UpdateServicesDto} from "./dto";


@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateServicesDto) {
        try {
            const categoryExists = await this.prisma.category.findUnique({
                where: { id: data.categoryId }
            });

            if (!categoryExists) {
                throw new NotFoundException(`Категория не найдена`);
            }


            return this.prisma.services.create({
                data: { ...data },
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            console.error('Ошибка создания услуги:', error);
            throw new InternalServerErrorException('Ошибка создания услуги');
        }
    }

    async findAll() {
        try {
            return this.prisma.services.findMany();
        } catch (error) {
            console.error('Ошибка поиска:', error);
            throw new InternalServerErrorException('Ошибка поиска');
        }
    }

    async findOne(id: string) {
        try {
            const service = await this.prisma.services.findUnique({
                where: { id }
            });
            if (!service) {
                throw new NotFoundException(`Услуга не найдена`);
            }
            return service;
        } catch (error) {
            console.error('Ошибка поиска:', error);
            throw new InternalServerErrorException('Ошибка поиска');
        }
    }

    async findByCategory(id: string) {
        try {
            const service = await this.prisma.services.findMany({
                where: { categoryId:id }
            });
            if (!service) {
                throw new NotFoundException(`Услуга не найдена`);
            }
            return service;
        } catch (error) {
            console.error('Ошибка поиска:', error);
            throw new InternalServerErrorException('Ошибка поиска');
        }
    }

    async update(id: string, data: UpdateServicesDto) {
        try {
            if (data.categoryId) {
                const categoryExists = await this.prisma.category.findUnique({
                    where: { id: data.categoryId }
                });
                if (!categoryExists) {
                    throw new NotFoundException(`Категория не найдена`);
                }
            }

            const service = await this.prisma.services.findUnique({ where: { id } });
            if (!service) {
                throw new NotFoundException(`Услуга не найдена`);
            }

            return this.prisma.services.update({
                where: { id }, data: { ...data }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            console.error('Ошибка обновления услуги:', error);
            throw new InternalServerErrorException('Ошибка обновления услуги');
        }
    }

    async remove(id: string) {
        try {
            const service = await this.prisma.services.findUnique({
                where: { id }
            });
            if (!service) {
                throw new NotFoundException(`Услуга не найдена`);
            }
            await this.prisma.services.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Ошибка удаления услуги:', error);
            throw new InternalServerErrorException('Ошибка удаления услуги');
        }
    }
}