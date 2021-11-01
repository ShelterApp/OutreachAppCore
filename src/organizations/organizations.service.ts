import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOriganizationDto } from './dto/create-organization.dto';
import { UpdateOriganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './schema/organization.schema';
import {SoftDeleteModel} from "soft-delete-plugin-mongoose";
import Helpers from "../utils/helper";
import { OrganizationStatus } from 'src/enum';
@Injectable()
export class OrganizationsService {
    constructor(
        @InjectModel(Organization.name) private organizationModel: SoftDeleteModel<OrganizationDocument>,
    ) { }

    async create(createOriganizationDto: CreateOriganizationDto): Promise<Organization> {
        if (!createOriganizationDto.status) {
            createOriganizationDto.status = OrganizationStatus.Enabled;
        }
        createOriganizationDto.code = Helpers.randomString(6);
        const createOriganization = this.organizationModel.create(createOriganizationDto);
        
        return createOriganization;
    }

    findAll() {
        return this.organizationModel.find().exec();
    }

    findOne(id: string) {
        return this.organizationModel.findById(id);
    }

    update(id: string, updateOriganizationDto: UpdateOriganizationDto) {
        const filter = { _id: id };
        return this.organizationModel.updateOne(filter, updateOriganizationDto);
    }

    async remove(id: string) {
        const filter = { _id: id };

        const deleted = await this.organizationModel.softDelete(filter);
        return deleted;
    }
}
