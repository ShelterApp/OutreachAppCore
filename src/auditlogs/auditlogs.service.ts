import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLogType } from 'src/enum';
import { CreateAuditlogDto, CreateAuditlogItem } from './dto/create-auditlog.dto';
import { Auditlog, AuditlogDocument } from './schema/auditlog.schema';
@Injectable()
export class AuditlogsService {
  constructor(
    @InjectModel(Auditlog.name) private auditlogModel: Model<AuditlogDocument>
  ) { }

  async create(objectId, orgId, userId, items, action, type) {
    let myItems : CreateAuditlogItem[] = [];
    if (items.length > 0) {
      for (const index in items) {
        const supply = items[index];
        const creatAuditLogItemDto = new CreateAuditlogItem();
        creatAuditLogItemDto.name = supply.name || supply.supplyName;
        creatAuditLogItemDto.qty = supply.qty;
        myItems.push(creatAuditLogItemDto);
      }
    }

    const createAuditLogDto = new CreateAuditlogDto();
    createAuditLogDto.objectId = objectId;
    createAuditLogDto.orgId = orgId;
    createAuditLogDto.userId = userId;
    createAuditLogDto.items = myItems;
    createAuditLogDto.action = action;
    createAuditLogDto.type = type;
    createAuditLogDto.createdAt = new Date();
    return await this.auditlogModel.create(createAuditLogDto);
  }

  async campLogs(campId, skip = 0, limit = 20) {
    let conditions = {
      type: AuditLogType.Camp,
      objectId: campId
    };
    const [result, total] = await Promise.all([
      this.auditlogModel
        .find(conditions)
        .sort({ createdAt: -1 })
        .populate({
          path: 'userId',
          select: 'name phone',
        })
        .skip(skip)
        .limit(limit),
      this.auditlogModel.count(conditions),
    ]);
    return {
      items: result,
      total: total
    };
  }

  async myWorks(userId, skip = 0, limit = 20) {
    const conditions = {
      userId: userId
    };
    const [result, total] = await Promise.all([
      this.auditlogModel
        .find(conditions)
        .sort({ createdAt: -1 })
        .populate({
          path: 'userId',
          select: 'name phone',
        })
        .skip(skip)
        .limit(limit),
      this.auditlogModel.count(conditions),
    ]);

    return {
      items: result,
      total: total
    };
  }  
}
