import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region, RegionDocument } from './schema/region.schema';

@Injectable()
export class RegionsService {

  constructor(
    @InjectModel(Region.name) private regionModel: SoftDeleteModel<RegionDocument>,
  ) { }

  async create(createRegionDto: CreateRegionDto) {
    try {
      return await this.regionModel.create(createRegionDto);
    } catch (error) {
      throw new BadRequestException('error_when_create_region');
    }
  }

  async findAll(searchParams, skip = 0, limit = 50) {
    const sort = this._buildSort({});
    const conditions = this._buildConditions(searchParams);
    const [result, total] = await Promise.all([
      this.regionModel
        .find(conditions)
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.regionModel.count(conditions)
    ]);
    return [result, total];
  }

  async findOne(id: string) {
    const region = await this.regionModel.findById(id);
    if (!region) {
      throw new NotFoundException('cannot_found_region');
    }
    return region;
  }

  async update(id: string, updateRegionDto: UpdateRegionDto) {
    // Check unique code
    const check = await this.regionModel.findOne({code: updateRegionDto.code, _id: {$ne: id}});
    if (check) {
      throw new BadRequestException('code_is_exsist');
    }

    const region = await this.regionModel.findByIdAndUpdate(id, updateRegionDto).setOptions({ new: true });

    if (!region) {
      throw new BadRequestException('cannot_update_region');
    }

    return region;
  }

  async remove(id: string) {
    const filter = { _id: id };
    const deleted = await this.regionModel.softDelete(filter);

    return deleted;
  }

  findByCode(code: string) {
    return this.regionModel.findOne({code: code});
  }

  _buildConditions(query) {
    type Conditions = {
        name: RegExp;
        code: string;
        parentId: string;
    }
    let conditions = {} as Conditions;
    if (query.keyword) {
      const searchTextRegex = new RegExp(query.keyword, 'i')
      conditions.name = searchTextRegex;
    }
    if (query.code) {
      conditions.code = query.code;
    }

    if (query.parentId) {
      conditions.parentId = query.parentId;
    }
    
    return conditions ? conditions : {};
  }

  _buildSort(query) {
    let sort = {};
    let sortBy = undefined !== query.sortBy ? query.sortBy : 'createdAt';
    let sortType = undefined !== query.sortType ? query.sortType : '-1';
    sort = [sortBy, sortType];
    return sort;
  }
}
