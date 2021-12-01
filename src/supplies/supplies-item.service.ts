import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { CreateSupplyItemsDto } from './dto/create-supply-items.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { SupplyItem, SupplyItemDocument } from './schema/supply-item.schema';
import { Supply, SupplyDocument } from './schema/supply.schema';
import * as _ from 'lodash';
/** 
 * đề nghị làm 1 trang quản lý supplies chung cho hệ thống. 
 * admin sẽ có quyền truy cập và quản lý ds tên supplies, mỗi org lead quản lý ds supplies của riêng mình thêm supply item thì chọn trong ds supplies của hệ thống
 * */
@Injectable()
export class SuppliesItemService {
  constructor(
    @InjectModel(SupplyItem.name) private supplyItemModel: SoftDeleteModel<SupplyItemDocument>,
    @InjectModel(Supply.name) private supplyModel: SoftDeleteModel<SupplyDocument>,
  ) { }

  async create(createSupplyItemDto: CreateSupplyItemDto) {
    try {
        // Find supply item by supplyId
        const supply = await this.supplyModel.findOne({_id: createSupplyItemDto.supplyId});
        if (supply) {
            const supplyItem = await this.supplyItemModel.findOneAndUpdate({
                supplyId: createSupplyItemDto.supplyId,
                organizationId: createSupplyItemDto.organizationId,
                isDeleted: false,
            }, createSupplyItemDto).setOptions({ new: true, upsert: true });
            if (supplyItem) {
                return await supplyItem.populate('supplyId')
            }
        } else {
          throw new UnprocessableEntityException('supplyId_invalid');
        }

    } catch (error) {
        console.log(error);
      throw new UnprocessableEntityException('error_when_create_supply_item');
    }
  }

  async createMany(createSupplyItemsDto: CreateSupplyItemsDto) {
    try {
        // Find supply item by supplyId
        const supplyIds = _.map(createSupplyItemsDto.supplyItems, 'supplyId');
        const supplies = await this.supplyModel.find({_id: {$in: supplyIds}});
        const suppliesByKey = _.keyBy(createSupplyItemsDto.supplyItems, 'supplyId');
        for (const supply of supplies) {
          await this.supplyItemModel.findOneAndUpdate({
              supplyId: supply._id,
              organizationId: createSupplyItemsDto.organizationId,
              isDeleted: false,
          }, {
            supplyId: supply._id,
            organizationId: createSupplyItemsDto.organizationId,
            qty: suppliesByKey[supply._id].qty
          }).setOptions({ new: true, upsert: true });
        }
        return true;
    } catch (error) {
        console.log(error);
      throw new UnprocessableEntityException('error_when_create_supply_item');
    }
  }

  async findAll(filter = {}, skip = 0, limit = 20) {
    const sort = this._buildSort(filter);
    const conditions = this._buildConditions(filter);
    const [result, total] = await Promise.all([
      this.supplyItemModel
        .find(conditions)
        .populate('supplyId')
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.supplyItemModel.count(conditions)
    ]);

    return [result, total];
  }

  async findOne(id: string) {
    const suppliesItem = await this.supplyItemModel.findOne({_id: id, isDeleted: false});
    if (!suppliesItem) {
      throw new NotFoundException('cannot_found_supply_item');
    }
    return await suppliesItem.populated('supplyId');
  }


  async remove(id: string) {
    const filter = { _id: id };
    const deleted = await this.supplyItemModel.softDelete(filter);
    if(deleted.deleted <= 0) {
      throw new UnprocessableEntityException('error_when_delete_supplies_item');
    }
    return deleted.deleted > 0 ? true : false;
  }

  _buildConditions(query) {
    type Conditions = {
      supplyId: string;
      organizationId: string;
    }
    let conditions = {} as Conditions;
    if (query.supplyId) {
      conditions.supplyId = query.supplyId;
    }
    if (query.organizationId) {
        conditions.organizationId = query.organizationId;
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
