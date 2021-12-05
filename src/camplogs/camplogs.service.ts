import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateCamplogDto } from './dto/create-camplog.dto';
import { CampLog, CampLogDocument } from './schema/camp-log.schema';

@Injectable()
export class CamplogsService {
  constructor(
    @InjectModel(CampLog.name) private campLogModel: SoftDeleteModel<CampLogDocument>,
  ) { }

  findAll() {
    return `This action returns all camplogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} camplog`;
  }

  async create(createCamplogDto: CreateCamplogDto) {
    try {
      return await this.campLogModel.create(createCamplogDto);
    } catch(error) {
      console.log(error);
    }
  }

}
