import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
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
import {
  CreateCampRequestDto,
  CreateSupplyListDto,
} from './dto/create-camp-request.dto';
import { RequestCamp, RequestCampDocument } from './schema/request-camp.schema';
@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name)
    private requestModel: SoftDeleteModel<RequestDocument>,
    @InjectModel(RequestUser.name)
    private requestUserModel: Model<RequestUserDocument>,
    @InjectModel(RequestCamp.name)
    private requestCampModel: Model<RequestCampDocument>,
  ) {}
  async create(createRequestDto: CreateRequestDto) {
    // Create Request
    try {
      const requestData = {
        name: createRequestDto.name,
        description: this._getDescriptionByCate(createRequestDto.cate),
        type: RequestType.UserRequest,
        address: createRequestDto.address,
        location: createRequestDto.location,
        createdBy: createRequestDto.createdBy,
      };
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
          location: createRequestDto.location,
        };
        const requestUser = await this.requestUserModel.create(requestUserData);
        request.externalId = requestUser._id;
        request.save();
        return this._setRequestDetail(request, requestUser);
      } else {
        await this.requestModel.deleteOne(request._id);
        throw new UnprocessableEntityException(
          'Error when create request info',
        );
      }
    } catch (error) {
      throw new UnprocessableEntityException('Error when create request');
    }
  }

  async createCampRequest(
    createCampRequestDto: CreateCampRequestDto,
    camp,
    createdBy,
  ) {
    // Create Request
    try {
      const requestData = {
        name: camp.name,
        description: this._getDescriptionBySupply(
          createCampRequestDto.supplies,
        ),
        type: RequestType.CampRequest,
        createdBy: createdBy,
      };
      const request = await this.requestModel.create(requestData);
      if (request) {
        const requestCampData = {
          requestId: request._id,
          campId: camp.id,
          supplies: createCampRequestDto.supplies,
        };
        const requestUser = await this.requestCampModel.create(requestCampData);
        request.externalId = requestUser._id;
        request.save();
        return this._setRequestDetail(request, requestCampData);
      } else {
        await this.requestModel.deleteOne(request._id);
        throw new UnprocessableEntityException(
          'Error when create request info',
        );
      }
    } catch (error) {
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
        .populate({
          path: 'createdBy',
          select: 'name phone',
        })
        .skip(skip)
        .limit(limit),
      this.requestModel.count(conditions),
    ]);
    const userRequestIds = _.map(
      _.filter(result, ['type', RequestType.UserRequest]),
      '_id',
    );
    const userRequestDetail = await this._getRequestDetailByType(
      RequestType.UserRequest,
      userRequestIds,
    );
    const campRequestIds = _.map(
      _.filter(result, ['type', RequestType.CampRequest]),
      '_id',
    );
    const campRequestDetail = await this._getRequestDetailByType(
      RequestType.CampRequest,
      campRequestIds,
    );
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

  async getMyClaim(userId, skip = 0, limit = 20) {
    const sort = this._buildSort({});
    const [result, total] = await Promise.all([
      this.requestModel
        .find({
          status: RequestStatus.Claim,
          claimBy: userId,
        })
        .sort([sort])
        .populate({
          path: 'createdBy',
          select: 'name phone',
        })
        .skip(skip)
        .limit(limit),
      this.requestModel.count({
        status: RequestStatus.Claim,
        claimBy: userId,
      }),
    ]);
    const userRequestIds = _.map(
      _.filter(result, ['type', RequestType.UserRequest]),
      '_id',
    );
    const userRequestDetail = await this._getRequestDetailByType(
      RequestType.UserRequest,
      userRequestIds,
    );
    const campRequestIds = _.map(
      _.filter(result, ['type', RequestType.CampRequest]),
      '_id',
    );
    const campRequestDetail = await this._getRequestDetailByType(
      RequestType.CampRequest,
      campRequestIds,
    );
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
    let updateData = {
      status: status,
    };
    switch (status) {
      case RequestStatus.Open:
        updateData = Object.assign(
          { claimBy: null, claimAt: null },
          updateData,
        );
        break;
      case RequestStatus.Claim:
        updateData = Object.assign(
          { claimBy: userId, claimAt: Date.now() },
          updateData,
        );
        break;
      case RequestStatus.Archive:
      case RequestStatus.Delete:
        updateData = Object.assign(
          { processBy: userId, processAt: Date.now() },
          updateData,
        );
        break;
    }
    return await this.requestModel.updateOne(
      { _id: id },
      {
        $set: updateData,
      },
    );
  }

  async findOne(id: string) {
    const request = await (
      await this.requestModel.findById(id)
    ).populate({
      path: 'createdBy',
      select: 'name phone', // 1st level subdoc (get comments)
      populate: {
        // 2nd level subdoc (get users in comments)
        path: 'organizationId',
        select: 'name', // space separated (selected fields only)
      },
    });
    if (!request) {
      throw new NotFoundException('cannot_found_organization');
    }
    const userRequestDetail = await this._getRequestDetailByType(request.type, [
      request._id,
    ]);
    return this._setRequestDetail(request, userRequestDetail[request._id]);
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }

  async _getRequestDetailByType(type: RequestType, requestIds: ObjectId[]) {
    switch (type) {
      case RequestType.UserRequest:
        const requestUsers = await this.requestUserModel
          .find({ requestId: { $in: requestIds } })
          .lean({ getters: true, versionKey: false });
        return _.keyBy(requestUsers, 'requestId');
        break;
      case RequestType.CampRequest:
        const requestCamps = await this.requestCampModel
          .find({ requestId: { $in: requestIds } })
          .lean({ getters: true, versionKey: false });
        return _.keyBy(requestCamps, 'requestId');
        break;
      default:
        throw new BadRequestException('Request yype invalid');
    }
  }

  _setRequestDetail(request, requestDetail) {
    const cloned = request.toObject({ getters: true, versionKey: false });
    cloned._id = cloned.id;
    delete cloned.id;
    cloned['requestInfo'] = requestDetail;

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

    return lookingForName.join(' / ');
  }

  _getDescriptionBySupply(supplies: CreateSupplyListDto[]) {
    let lookingForName = [];
    for (const i in supplies) {
      lookingForName.push(supplies[i].qty + ' ' + supplies[i].supplyName);
    }

    return lookingForName.join(' / ');
  }

  _buildConditions(query) {
    type Conditions = {
      name: string;
      description: string;
      status: RequestStatus;
      type: RequestType;
      $and: object[];
    };
    let conditions = {} as Conditions;
    if (query.keyword) {
      conditions.$and = [];
      conditions.$and.push({
        $or: [
          { name: { $regex: query.keyword, $options: 'i' } },
          { description: { $regex: query.keyword, $options: 'i' } },
        ],
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
