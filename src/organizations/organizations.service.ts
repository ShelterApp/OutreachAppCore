import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOriganizationDto } from './dto/create-organization.dto';
import { UpdateOriganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './schema/organization.schema';
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import Helpers from "../utils/helper";
import { OrganizationStatus } from '../enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

interface VerificationTokenPayload {
    email: string;
}

export default VerificationTokenPayload;
@Injectable()
export class OrganizationsService {
    constructor(
        @InjectModel(Organization.name) private organizationModel: SoftDeleteModel<OrganizationDocument>,
        private readonly jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailerService,
    ) { }

    async create(createOriganizationDto: CreateOriganizationDto): Promise<Organization> {
        if (!createOriganizationDto.status) {
            createOriganizationDto.status = OrganizationStatus.Enabled;
        }
        createOriganizationDto.code = Helpers.randomString(6);
        const createOriganization = this.organizationModel.create(createOriganizationDto);

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
            this.organizationModel.count(conditions)
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
        const org = this.organizationModel.findOne({ code: code, status: OrganizationStatus.Enabled, isDeleted: false })

        return org;
    }

    public findById(id: string) {
        const org = this.organizationModel.findById(id);

        return org;
    }

    async update(id: string, updateOriganizationDto: UpdateOriganizationDto) {
        const org = await this.organizationModel.findByIdAndUpdate(id, updateOriganizationDto).setOptions({ new: true });

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
            expiresIn: `1d`
        });

        return this.mailService.sendMail({
            to: email,
            from: this.configService.get('mailer').from,
            subject: 'Register account for OutreachApp',
            template: './welcome', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
            context: {
                url: this.configService.get('email_confirmation_url'),
                token: token
            },
        })

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
        let sort_by = undefined !== query.sort_by ? query.sort_by : 'createdAt';
        let sort_type = undefined !== query.sort_type ? query.sort_type : '-1';
        sort = [sort_by, sort_type];
        return sort;
    }
}
