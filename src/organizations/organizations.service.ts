import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOriganizationDto } from './dto/create-organization.dto';
import { UpdateOriganizationDto } from './dto/update-organization.dto';
import {
  Organization,
  OrganizationDocument,
} from './schema/organization.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import Helpers from '../utils/helper';
import { OrganizationStatus } from '../enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SendgridService } from '../sendgrid/sendgrid.service';

interface VerificationTokenPayload {
  email: string;
}

export default VerificationTokenPayload;
@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: SoftDeleteModel<OrganizationDocument>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private sendgridService: SendgridService,
  ) {}

  async create(
    createOriganizationDto: CreateOriganizationDto,
  ): Promise<Organization> {
    if (!createOriganizationDto.status) {
      createOriganizationDto.status = OrganizationStatus.Enabled;
    }
    createOriganizationDto.code = Helpers.randomString(6);
    const createOriganization = this.organizationModel.create(
      createOriganizationDto,
    );

    return createOriganization;
  }

  async findAll(filter = {}, skip = 0, limit = 50) {
    const sort = this._buildSort(filter);
    const conditions = this._buildConditions(filter);
    const [result, total] = await Promise.all([
      this.organizationModel
        .find(conditions)
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.organizationModel.count(conditions),
    ]);
    return [result, total];
  }

  async findOne(id: string) {
    const org = await this.organizationModel.findById(id);
    if (!org) {
      throw new NotFoundException('cannot_found_organization');
    }
    return org;
  }

  public findByCode(code: string) {
    const org = this.organizationModel.findOne({
      code: code,
      status: OrganizationStatus.Enabled,
      isDeleted: false,
    });

    return org;
  }

  public findById(id: string) {
    const org = this.organizationModel.findById(id);

    return org;
  }

  async update(id: string, updateOriganizationDto: UpdateOriganizationDto) {
    const org = await this.organizationModel
      .findByIdAndUpdate(id, updateOriganizationDto)
      .setOptions({ new: true });

    if (!org) {
      throw new UnprocessableEntityException('error_when_update_org');
    }

    return org;
  }

  async remove(id: string) {
    const filter = { _id: id };

    const deleted = await this.organizationModel.softDelete(filter);
    return deleted;
  }

  async sendEmailVerification(email: string): Promise<any> {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt').secret,
      expiresIn: `1d`,
    });

    const url = this.configService.get('email_confirmation_url');

    return this.sendgridService.send({
      to: email,
      subject: 'Register account for OutreachApp',
      from: this.configService.get('mailer').user,
      html: `<div style="width: 768px">
          <p>Hi There</p>
          
          <p>Agape Silicon Valley registered you for volunteering for 
          OutreachApp. Please click the below link to compete the signup 
          Process.</p>
          
          <a href="${url}?code=${token}">${url}</a>
          
          <p>If you didn't signup for this volunteer opportunity, Please ignore this email.</p>
          <p></p>
          <p>Thanks,</p>
          <p>Your OutreachApp Team</p>
          <p><a href="https://outreachapp.org">https://outreachapp.org</a></p>
          <p><a href="https://www.facebook.com/OutreachAppInfo">https://www.facebook.com/OutreachAppInfo</a></p>
          <p><a href="https://twitter.com/OutreachAppInfo"></a></p>
          </div>`,
    });
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
    let sortBy = undefined !== query.sortBy ? query.sortBy : 'createdAt';
    let sortType = undefined !== query.sortType ? query.sortType : '-1';
    sort = [sortBy, sortType];
    return sort;
  }
}
