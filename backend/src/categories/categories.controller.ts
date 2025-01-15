import {Body, Controller, Delete, Get, Post, Put, Query, UseGuards} from '@nestjs/common';
import {CategoryService} from "./categories.service";
import {CreateCategoryDto, UpdateCategoryDto} from "./dto";
import {TokenGuard} from "../auth";

@UseGuards(TokenGuard)
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    findOne(@Query('id') id: string, @Query('userId') userId: string) {
        if(id) {
            return this.categoryService.findOne(id);
        } else if (userId) {
            return  this.categoryService.findByUser(userId);
        } else {
            return this.categoryService.findAll();
        }
    }

    @Put()
    update(@Query('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Query('id') id: string) {
        return this.categoryService.remove(id);
    }
}
