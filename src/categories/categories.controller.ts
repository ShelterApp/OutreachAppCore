import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/enum';
import { PaginationParams } from 'src/utils/pagination-params';
import ParamsWithId from 'src/utils/params-with-id';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@ApiTags('Categories [Im Looking for...]')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new category' })
  @ApiOkResponse({status: 200, description: 'category object'})
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list category' })
  @ApiOkResponse({status: 200, description: 'category list'})
  async find() {
    const [items, total] = await this.categoriesService.findAll({});
    return {
      items,
      total
    };
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update category' })
  @ApiOkResponse({status: 200, description: 'category object'})
  async update(@Param() { id }: ParamsWithId, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete category' })
  @ApiOkResponse({status: 204, description: 'No content'})
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response): Promise<void> {
    await this.categoriesService.remove(id);

    res.status(204).send();
  }
}
