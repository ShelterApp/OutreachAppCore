import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RequestStatus, RequestType } from '../enum';
import { SearchParams } from './dto/search-params.dto';
import { CateDto, CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestUser, RequestUserDocument } from './schema/request-user.schema';
import { Request, RequestDocument } from './schema/request.schema';
import * as _ from 'lodash';
import { CreateCampRequestDto, CreateSupplyListDto } from './dto/create-camp-request.dto';
import { RequestCamp, RequestCampDocument } from './schema/request-camp.schema';
import { CampsService } from 'src/camps/camps.service';
@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: SoftDeleteModel<RequestDocument>,
    @InjectModel(RequestUser.name) private requestUserModel: Model<RequestUserDocument>,
    @InjectModel(RequestCamp.name) private requestCampModel: Model<RequestCampDocument>,
    private readonly configService: ConfigService,
    private readonly campsService: CampsService,
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
        location: createRequestDto.location
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
          location: createRequestDto.location
        }
        const requestUser = await this.requestUserModel.create(requestUserData);
        request.externalId = requestUser._id;
        request.save();
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

  async createCampRequest(createCampRequestDto: CreateCampRequestDto, camp, creator) {
    // Create Request
    try {
      const requestData = {
        name: camp.name,
        description: this._getDescriptionBySupply(createCampRequestDto.supplies),
        type: RequestType.CampRequest,
        creator: creator
      }
      console.log(requestData);
      const request = await this.requestModel.create(requestData);
      if (request) {
        const requestCampData = {
          requestId: request._id,
          campId: camp.id,
          supplies: createCampRequestDto.supplies,
        }
        const requestUser = await this.requestCampModel.create(requestCampData);
        request.externalId = requestUser._id;
        request.save();
        return this._setRequestDetail(request, requestCampData);
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
    const userRequestIds = _.map(_.filter(result, ['type', RequestType.UserRequest]), '_id');
    const userRequestDetail = await this._getRequestDetailByType(RequestType.UserRequest, userRequestIds);
    const campRequestIds = _.map(_.filter(result, ['type', RequestType.CampRequest]), '_id');
    console.log(campRequestIds);
    const campRequestDetail = await this._getRequestDetailByType(RequestType.CampRequest, campRequestIds);
    const myResult = [];
    for (const res of result) {
      if (userRequestDetail[res._id]) {
        myResult.push(this._setRequestDetail(res, userRequestDetail[res._id]));
      }
      if (campRequestDetail[res._id]) {
        myResult.push(this._setRequestDetail(res, campRequestDetail[res._id]));
      }
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

  async _getRequestDetailByType(type : RequestType, requestIds: ObjectId[]) {
    switch(type) {
      case RequestType.UserRequest:
        const requestUsers = await this.requestUserModel.find({requestId: {$in: requestIds}}).lean({getters: true, versionKey: false});
        return _.keyBy(requestUsers, 'requestId');
        break;
      case RequestType.CampRequest:
        const requestCamps = await this.requestCampModel.find({requestId: {$in: requestIds}}).lean({getters: true, versionKey: false});
        return _.keyBy(requestCamps, 'requestId');
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

  _getDescriptionBySupply(supplies: CreateSupplyListDto[]) {
    let lookingForName = [];
    for(const i in supplies) {
      lookingForName.push(supplies[i].qty + ' ' + supplies[i].supplyName);
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
    let sortBy = undefined !== query.sortBy ? query.sortBy : 'createdAt';
    let sortType = undefined !== query.sortType ? query.sortType : '-1';
    sort = [sortBy, sortType];
    return sort;
  }
}
