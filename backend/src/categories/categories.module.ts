import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoryController } from './categories.controller';
import { PrismaService } from '../prisma';

@Module({
  providers: [
    {
      provide: CategoryService,
      useClass: CategoryService,
    },
    PrismaService,
  ],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoriesModule {}
