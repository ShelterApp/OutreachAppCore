import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page, PageDocument } from './schema/page.schema';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  ) { }
  create(createPageDto: CreatePageDto) {
    return this.pageModel.create(createPageDto);
  }

  async findAll(skip = 0, limit = 50) {
    const [result, total] = await Promise.all([
      this.pageModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.pageModel.count(),
    ]);
    return [result, total];
  }

  findOneByIdentifier(identifier: string) {
    return this.pageModel.findOne({identifier: identifier});
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    updatePageDto.updatedAt = new Date();
    const page = await this.pageModel.findByIdAndUpdate(id, updatePageDto).setOptions({ new: true });
    if (!page) {
      throw new BadRequestException('cannot_update_page');
    }
    return page;
  }
}