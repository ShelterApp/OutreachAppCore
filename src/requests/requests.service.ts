import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RequestType } from 'src/enum';
import { CateDto, CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestUser } from './schema/request-user.schema';
import { Request, RequestDocument } from './schema/request.schema';

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
        description: this.getDescriptionByCate(createRequestDto.cate),
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
        const result = request.toObject({getters: true, versionKey: false});
        result._id = result.id
        delete result.id
        result['requestInfo'] = requestUser;
        return result;
      } else {
        await this.requestModel.deleteOne(request._id);
        throw new UnprocessableEntityException('Error when create request info');
      }
    } catch(error) {
      console.log(error)
      throw new UnprocessableEntityException('Error when create request');
    }
  }

  getDescriptionByCate(cate: CateDto) {
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

  findAll() {
    return `This action returns all requests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
