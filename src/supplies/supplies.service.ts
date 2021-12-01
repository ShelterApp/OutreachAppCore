import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SupplyStatus } from 'src/enum';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply, SupplyDocument } from './schema/supply.schema';
import * as _ from 'lodash';
/** 
 * đề nghị làm 1 trang quản lý supplies chung cho hệ thống. 
 * admin sẽ có quyền truy cập và quản lý ds tên supplies, mỗi org lead quản lý ds supplies của riêng mình thêm supply item thì chọn trong ds supplies của hệ thống
 * */
@Injectable()
export class SuppliesService {
  constructor(
    @InjectModel(Supply.name) private supplyModel: SoftDeleteModel<SupplyDocument>,
  ) { }

  async create(createSupplyDto: CreateSupplyDto) {
    try {
      if (!createSupplyDto.status) {
        createSupplyDto.status = SupplyStatus.Enabled;
      }
      const supply = await this.supplyModel.create(createSupplyDto);

      return supply;
    } catch (error) {
      throw new UnprocessableEntityException('error_when_create_supply');
    }
  }

  async findAll(filter = {}, skip = 0, limit = 20) {
    const sort = this._buildSort(filter);
    const conditions = this._buildConditions(filter);
    const [result, total] = await Promise.all([
      this.supplyModel
        .find(conditions)
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.supplyModel.count(conditions)
    ]);

    return [result, total];
  }

  async findOne(id: string) {
    const supply = await this.supplyModel.findById(id);
    if (!supply) {
      throw new NotFoundException('cannot_found_supply');
    }
    return supply;
  }

  async update(id: string, updateSupplyDto: UpdateSupplyDto) {
    const supply = await this.supplyModel.findByIdAndUpdate(id, updateSupplyDto).setOptions({ new: true });

    if (!supply) {
      throw new UnprocessableEntityException('error_when_update_supply');
    }

    return supply;
  }

  async remove(id: string) {
    const filter = { _id: id };
    const deleted = await this.supplyModel.softDelete(filter);

    if(deleted.deleted <= 0) {
      throw new UnprocessableEntityException('error_when_delete_supplies_item');
    }
    return deleted.deleted > 0 ? true : false;
  }

  _buildConditions(query) {
    type Conditions = {
      name: RegExp;
      status: number;
    }
    let conditions = {} as Conditions;
    if (query.keyword) {
      const searchTextRegex = new RegExp(query.keyword, 'i')
      conditions.name = searchTextRegex;
    }
    if (query.status) {
      conditions.status = query.status;
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
