import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { CreateSupplyItemsDto } from './dto/create-supply-items.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { SupplyItem, SupplyItemDocument } from './schema/supply-item.schema';
import { Supply, SupplyDocument } from './schema/supply.schema';
const mongoose = require('mongoose');
import * as _ from 'lodash';
import { SupplyTransaction, SupplyTransactionDocument, SupplyTransactionSchema } from './schema/supply-transaction.schema';
import { ObjectId } from 'mongoose';
import { TransactionType } from 'src/enum';
import { DropSupply } from 'src/camps/schema/drop-supply.schema';
/** 
 * đề nghị làm 1 trang quản lý supplies chung cho hệ thống. 
 * admin sẽ có quyền truy cập và quản lý ds tên supplies, mỗi org lead quản lý ds supplies của riêng mình thêm supply item thì chọn trong ds supplies của hệ thống
 * */


 export class SupplyTransactionDto {
  supplyId: ObjectId;
  supplyName: string;
  qty: number;
  externalId: String;
  type: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SuppliesItemService {
  constructor(
    @InjectModel(SupplyItem.name) private supplyItemModel: SoftDeleteModel<SupplyItemDocument>,
    @InjectModel(Supply.name) private supplyModel: SoftDeleteModel<SupplyDocument>,
    @InjectModel(SupplyTransaction.name) private supplyTransactionModel: SoftDeleteModel<SupplyTransactionDocument>,
  ) { }

  async create(createSupplyItemDto: CreateSupplyItemDto) {
    try {
      // Find supply item by supplyId
      const supply = await this.supplyModel.findOne({
        _id: createSupplyItemDto.supplyId,
      });
      if (supply) {
        const currentItem = await this.supplyItemModel
          .findOneAndUpdate(
            {
              supplyId: createSupplyItemDto.supplyId,
              organizationId: createSupplyItemDto.organizationId,
              isDeleted: false,
            },
            createSupplyItemDto,
          )
          .setOptions({ new: true, upsert: true });
        if (currentItem) {
          const change = createSupplyItemDto.qty - currentItem.qty;
          const supplyItem = await currentItem.populate('supplyId');
          // write transaction
          await this.supplyTransactionModel.create({
            supplyId: supplyItem._id,
            supplyName: supplyItem.supplyId.name,
            qty: change,
            organizationId: supplyItem.organizationId,
            externalId: supplyItem.organizationId,
            type: TransactionType.Add,
            createdBy: createSupplyItemDto.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return supply;
      } else {
        throw new UnprocessableEntityException('supplyId_invalid');
      }
    } catch (error) {
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
          const currentItem = await this.supplyItemModel.findOneAndUpdate({
                supplyId: supply._id,
                organizationId: createSupplyItemsDto.organizationId,
                isDeleted: false,
            }, {
              supplyId: supply._id,
              organizationId: createSupplyItemsDto.organizationId,
              qty: suppliesByKey[supply._id].qty
            }).setOptions({ new: true, upsert: true });
            if (currentItem) {
                // Update
                const qty = suppliesByKey[supply._id].qty;
                let change = qty - currentItem.qty;
                currentItem.qty = qty;
                currentItem.save();
                const supplyItem = await currentItem.populate('supplyId');
                // write transaction
                await this.supplyTransactionModel.create({
                    supplyId: supplyItem._id,
                    supplyName: supplyItem.supplyId.name,
                    qty: change,
                    organizationId: supplyItem.organizationId,
                    externalId: supplyItem.organizationId,
                    type: TransactionType.Add,
                    createdBy: createSupplyItemsDto.createdBy,
                    createdAt: new Date,
                    updatedAt: new Date
                });

            }

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
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.supplyItemModel.count(conditions),
    ]);

    return [result, total];
  }

  async findOne(id: string) {
    try {
      const suppliesItem = await this.supplyItemModel.findOne({_id: id, isDeleted: false});
      if (!suppliesItem) {
        throw new NotFoundException('cannot_found_supply_item');
      }
      const supply = await this.supplyModel.findById(suppliesItem.supplyId);
      suppliesItem.supplyId = supply;
      return suppliesItem;
    } catch(error) {
      console.log(error);
      throw new UnprocessableEntityException('error_unknown');
    }
  }

  async getSupplyByOrgId(supplyIds, organizationId) {
    console.log(supplyIds, organizationId);
    const suppliesItems = await this.supplyItemModel.find({
      supplyId: {
        $in: supplyIds
      },
      organizationId: organizationId
    }).lean();

    return suppliesItems;
  }

  async validateSupply(supplies, organizationId) {
    const supplyIds = _.map(supplies, (supply) => {
      return mongoose.Types.ObjectId(supply.supplyId);
    });
    const suppliesItems = await this.getSupplyByOrgId(supplyIds, organizationId);
    const supplyByKey = _.keyBy(suppliesItems, 'supplyId');
    for (const supplyItem of supplies) {
      if (!(supplyByKey[supplyItem.supplyId]) || supplyByKey[supplyItem.supplyId].qty < supplyItem.qty) {
        return false;
      }
    }

    return true;
  }

  async dropItem(drop) {
    try {
      for(const dropItem of drop.supplies) {
          const currentItem = await this.supplyItemModel.findOne({
              supplyId: dropItem.supplyId,
              organizationId: drop.organizationId,
              isDeleted: false,
          });
          if (currentItem) {
            // Update
            let change = currentItem.qty - dropItem.qty;
            currentItem.qty = change;
            currentItem.save();
            const supplyItem = await currentItem.populate('supplyId');
            // write transaction
            await this.supplyTransactionModel.create({
                supplyId: supplyItem._id,
                supplyName: supplyItem.supplyId.name,
                qty: -dropItem.qty,
                organizationId: supplyItem.organizationId,
                externalId: drop._id,
                type: TransactionType.Drop,
                createdBy: drop.createdBy,
                createdAt: new Date,
                updatedAt: new Date
              });
        }
      }
    } catch(error) {
      console.log(error);
      throw new UnprocessableEntityException('error_can_decrease_item');
    }
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
    sort[sortBy] = sortType;
    return sort;
  }
}
