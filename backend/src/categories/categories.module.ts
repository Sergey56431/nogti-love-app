import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoryController } from './categories.controller';
import { PrismaService } from "../prisma";

@Module({
  providers: [CategoryService, PrismaService],
  controllers: [CategoryController]
})
export class CategoriesModule {}
