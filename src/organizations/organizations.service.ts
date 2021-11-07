import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOriganizationDto } from './dto/create-organization.dto';
import { UpdateOriganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './schema/organization.schema';
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import Helpers from "../utils/helper";
import { OrganizationStatus } from '../enum';
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
        const region = await this.organizationModel.findById(id);
        if (!region) {
            throw new NotFoundException('cannot_found_organization');
        }
        return region;
    }

    public findByCode(code: string) {
        const org = this.organizationModel.findOne({ code: code, status: OrganizationStatus.Enabled })

        return org;
    }

    public findById(id: string) {
        const org = this.organizationModel.findById(id);

        return org;
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
