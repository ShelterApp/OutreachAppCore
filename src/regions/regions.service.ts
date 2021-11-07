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
    } catch(error) {
      console.log(error);
      throw new BadRequestException('error_when_create_region');
    }
  }

  async findAll(filter = {}, skip = 0, limit = 50) {
    const sort = this._buildSort(filter);
    const conditions = this._buildConditions(filter);
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
    let conditions = {};
    // if (undefined !== query.search_text) {
    //   const searchTextRegex = new RegExp(query.search_text, 'i')
    //   conditions.name = searchTextRegex;
    // }

    return conditions;
  }

  _buildSort(query) {
    let sort = {};
    let sort_by = undefined !== query.sort_by ? query.sort_by : 'createdAt';
    let sort_type = undefined !== query.sort_type ? query.sort_type : '-1';
    sort = [sort_by, sort_type];
    return sort;
  }
}
