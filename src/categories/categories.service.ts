import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './shema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: SoftDeleteModel<CategoryDocument>,
  ) { }

  async create(createRegionDto: CreateCategoryDto) {
    try {
      return await this.categoryModel.create(createRegionDto);
    } catch (error) {
      throw new BadRequestException('error_when_create_category');
    }
  }

  async findAll(filter = {}) {
    const [result, total] = await Promise.all([
      this.categoryModel
        .find()
        .sort({displayOrder: 1}),
      this.categoryModel.count()
    ]);
    return [result, total];
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto).setOptions({ new: true });

    if (!category) {
      throw new BadRequestException('cannot_update_category');
    }

    return category;
  }

  async remove(id: string) {
    const filter = { _id: id };
    const deleted = await this.categoryModel.softDelete(filter);

    return deleted;
  }

}
