import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RequestStatus, RequestType } from '../enum';
import { SearchParams } from './dto/search-params.dto';
import { CateDto, CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestUser } from './schema/request-user.schema';
import { Request, RequestDocument } from './schema/request.schema';
import * as _ from 'lodash';
@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: SoftDeleteModel<RequestDocument>,
    @InjectModel(RequestUser.name) private requestUserModel: Model<RequestDocument>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) { }
  async create(createRequestDto: CreateRequestDto) {
    // Create Request
    try {
      const requestData = {
        name: createRequestDto.name,
        description: this._getDescriptionByCate(createRequestDto.cate),
        type: RequestType.UserRequest,
        address: createRequestDto.address,
        lat: createRequestDto.lat,
        lng: createRequestDto.lng
      }
      const request = await this.requestModel.create(requestData);
      if (request) {
        const requestUserData = {
          requestId: request._id,
          name: createRequestDto.name,
          email: createRequestDto.email,
          phone: createRequestDto.phone,
          note: createRequestDto.note,
          cate: createRequestDto.cate,
          address: createRequestDto.address,
          lat: createRequestDto.lat,
          lng: createRequestDto.lng
        }
        const requestUser = await this.requestUserModel.create(requestUserData);
        return this._setRequestDetail(request, requestUser);
      } else {
        await this.requestModel.deleteOne(request._id);
        throw new UnprocessableEntityException('Error when create request info');
      }
    } catch(error) {
      console.log(error)
      throw new UnprocessableEntityException('Error when create request');
    }
  }

  async findAll(searchParams: SearchParams, skip = 0, limit = 20) {
    const sort = this._buildSort({});
    const conditions = this._buildConditions(searchParams);
    const [result, total] = await Promise.all([
      this.requestModel
        .find(conditions)
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.requestModel.count(conditions)
    ]);
    const requestIds = _.map(result, '_id');
    const requestDetail = await this._getRequestDetailByType(RequestType.UserRequest, requestIds);
    const myResult = [];
    for (const res of result) {
      myResult.push(this._setRequestDetail(res, requestDetail[res._id]));
    }

    return [myResult, total];
  }

  async changeStatus(id: string, status: RequestStatus, userId: string) {
    return await this.requestModel.updateOne({ _id: id }, { 
      '$set': { 
        "status": status,
        "processBy": userId,
        "processAt": Date.now() 
      } 
    });
  }

  async findOne(id: string) {
    const request = await this.requestModel.findById(id);
    if (!request) {
        throw new NotFoundException('cannot_found_organization');
    }
    const requestUser = await this.requestUserModel.findOne({requestId: request._id}).lean();
    return this._setRequestDetail(request, requestUser);
}

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }

  async _getRequestDetailByType(type : RequestType, requestIds: string[]) {
    switch(type) {
      case RequestType.UserRequest:
        const requestUsers = await this.requestUserModel.find({requestId: {$in: requestIds}}).lean({getters: true, versionKey: false});
        return _.keyBy(requestUsers, 'requestId');
        break;
      case RequestType.CampRequest:
        break;
      default:
        throw new BadRequestException('Request yype invalid');
    }
  }

  _setRequestDetail(request, requestDetail) {
    const cloned = request.toObject({getters: true, versionKey: false});
    cloned._id = cloned.id
    delete cloned.id
    cloned['requestInfo'] =  requestDetail;

    return cloned;
  }

  _getDescriptionByCate(cate: CateDto) {
    let lookingForName = [];

    if (cate.parentCateName) {
      lookingForName.push(cate.parentCateName);
    }

    if (cate.subCateName) {
      lookingForName.push(cate.subCateName);
    }

    if (cate.sizeCateName) {
      lookingForName.push(cate.sizeCateName);
    }

    return lookingForName.join(' / ')
  }

  _buildConditions(query) {
    type Conditions = {
        name: string;
        description: string;
        status: RequestStatus;
        type: RequestType;
        $and: object[];
    }
    let conditions = {} as Conditions;
    if (query.keyword) {
      conditions.$and = [];
      conditions.$and.push({
          $or: [
              { name: { $regex: query.keyword, $options: "i" } },
              { description: { $regex: query.keyword, $options: "i" } }
          ]
      });
    }

    if (query.status) {
      conditions.status = query.status;
    }

    if (query.type) {
      conditions.type = query.type;
    }

    
    return conditions ? conditions : {};

  }

  _buildSort(query) {
    let sort = {};
    let sort_by = undefined !== query.sort_by ? query.sort_by : 'createdAt';
    let sort_type = undefined !== query.sort_type ? query.sort_type : '-1';
    sort = [sort_by, sort_type];
    return sort;
  }
}
