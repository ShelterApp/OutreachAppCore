import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { count } from 'console';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CampStatus, CampType } from 'src/enum';
import { RequestsService } from '../requests/requests.service';
import { SortParams } from '../utils/sort-params.dto';
import { CreateCampDto } from './dto/create-camp.dto';
import { DropSupplyDto } from './dto/drop-supply.dto';
import { SearchParams } from './dto/search-params.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { Camp, CampDocument } from './schema/camp.schema';
import { DropSupply, DropSupplyDocument } from './schema/drop-supply.schema';

@Injectable()
export class CampsService {
  constructor(
    @InjectModel(Camp.name) private campModel: SoftDeleteModel<CampDocument>,
    @InjectModel(DropSupply.name)
    private dropSupplyModel: SoftDeleteModel<DropSupplyDocument>,
  ) {}

  async create(createCampDto: CreateCampDto) {
    try {
      createCampDto.numOfPeople = createCampDto.people.length;
      return await this.campModel.create(createCampDto);
    } catch (error) {
      throw new BadRequestException('error_when_create_camps');
    }
  }

  async findAll(
    searchParams: SearchParams,
    sortParams: SortParams,
    skip = 0,
    limit = 20,
  ) {
    try {
      const sort = this._buildSort(sortParams);
      const conditions = this._buildConditions(searchParams);
      const [result, total] = await Promise.all([
        this.campModel
          .find(conditions)
          .populate({
            path: 'createdBy',
            select: 'name phone',
          })
          .populate({
            path: 'updatedBy',
            select: 'name phone',
          })
          .sort([sort])
          .skip(skip)
          .limit(limit),
        searchParams.lat && searchParams.lng
          ? 0
          : this.campModel.countDocuments(conditions),
      ]);
      return [result, total == 0 ? result.length : total];
    } catch (error) {
      throw new BadRequestException('error_when_get_camps');
    }
  }

  async findOne(id: string, projection = '') {
    const camp = await this.campModel.findById(id, projection);
    if (!camp) {
      throw new NotFoundException('cannot_found_camp');
    }
    return camp;
  }

  async update(id: string, updateCampDto: any) {
    //Hung edited
    if (updateCampDto.people && updateCampDto.people.length > 0) {
      updateCampDto.numOfPeople = updateCampDto.people.length;
    }
    const supply = await this.campModel
      .findByIdAndUpdate(id, updateCampDto)
      .setOptions({ new: true });

    if (!supply) {
      throw new UnprocessableEntityException('error_when_update_camp');
    }

    return supply;
  }

  async remove(id: string) {
    const filter = { _id: id };
    const deleted = await this.campModel.softDelete(filter);

    if (deleted.deleted <= 0) {
      throw new UnprocessableEntityException('error_when_delete_camp');
    }
    return deleted.deleted > 0 ? true : false;
  }

  /**
   * =======================================DROP SUPPLIES=====================================================
   * */
  async dropSupply(dropSupplyDto: DropSupplyDto) {
    try {
      return this.dropSupplyModel.create(dropSupplyDto);
    } catch (error) {
      throw new BadRequestException('error_when_drop_supplies');
    }
  }
  /**
   * =======================================END DROP SUPPLIES===================================================
   */

  _buildConditions(query) {
    type Conditions = {
      name: string;
      description: string;
      status: CampStatus;
      type: CampType;
      location: any;
      isDeleted: boolean;
      $and: object[];
    };
    let conditions = { isDeleted: false } as Conditions;
    if (query.keyword) {
      conditions.$and = [];
      conditions.$and.push({
        $or: [
          { name: { $regex: query.keyword, $options: 'i' } },
          { description: { $regex: query.keyword, $options: 'i' } },
        ],
      });
    }

    if (query.lat && query.lng) {
      conditions.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [query.lng, query.lat],
          },
          $maxDistance: 50000,
        },
      };
      if (query.maxDistance) {
        conditions.location.$near.$maxDistance = query.maxDistance;
      }
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
    const acceptSort = ['createdAt', 'numOfPeople', 'numOfPet', 'name'];
    let sortBy =
      undefined !== query.sortBy && acceptSort.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    let sortType = -1;
    if (undefined !== query.sortType && query.sortType == 'asc') {
      sortType = 1;
    }
    sort = [sortBy, sortType];
    return sort;
  }
}
