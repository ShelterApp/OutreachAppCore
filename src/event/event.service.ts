import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/users/schema/user.schema';
import { SortParams } from 'src/utils/sort-params.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { SearchParams } from './dto/search-params.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventAttendees, EventAttendeesDocument } from './schema/event-attendees.schema';
import { EventDocument, Event } from './schema/event.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: SoftDeleteModel<EventDocument>,
    @InjectModel(EventAttendees.name) private eventAttendeesModel: SoftDeleteModel<EventAttendeesDocument>,
    private readonly logger: Logger,
  ) { }
  async create(createEventDto: CreateEventDto) {
    try {
      return await this.eventModel.create(createEventDto);
    } catch(e) {
      this.logger.error(e);
      throw new UnprocessableEntityException('Error When Create Event');
    }
  }

  async findAll(searchParams: SearchParams, sortParams: SortParams, skip = 0, limit = 20) {
    let sort = this._buildSort(sortParams);
    const conditions = this._buildConditions(searchParams);
    if (searchParams.lat && searchParams.lng) {
      sort = [];
    }
    console.log(sort);
    const [result, total] = await Promise.all([
      this.eventModel
        .find(conditions)
        .populate({ 
          path: "createdBy",
          select: 'name phone'
        })
        .sort([sort])
        .skip(skip)
        .limit(limit),
        (searchParams.lat && searchParams.lng) ? 0 : this.eventModel.countDocuments(conditions)
    ]);
    const myResult = [];
    for(const res of result) {
      const attendees = await this.eventAttendeesModel.find({eventId: res._id}).select('-_id userId userName userPhone userEmail attendedAt').lean();
      
      myResult.push(this._setAttendees(res, attendees));
    }

    return [myResult, total];
  }

  async findOne(id: string) {
    const event = await (await (await this.eventModel.findById(id)).populate({
      path: "createdBy",
      select: 'name phone'
    }));
    if (!event) {
      throw new NotFoundException('cannot_found_event');
    }
    const attendees = await this.eventAttendeesModel.find({eventId: event._id}).select('-_id userId userName userPhone userEmail attendedAt').lean();
    return this._setAttendees(event, attendees);
  }

  async findById(id: string, projection = '') {
    const event = await this.eventModel.findById(id, projection);
    if (!event) {
      throw new NotFoundException('cannot_found_event');
    }
    return event;
  }

  async joinEvent(id: string, user) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('cannot_found_event');
    }
    if (event.countAttended < event.maxAttended) {
      // Check join event
      const userId = user._id || user.id;
      const joined = await this.eventAttendeesModel.findOne({eventId: event._id, userId: userId});
      if (!joined) {
        const attend = await this.eventAttendeesModel.create({
          eventId: event._id,
          userId: userId,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          attendedAt: new Date()
        });
        event.countAttended = event.countAttended + 1;
        event.save();
        return true;
      } else {
        throw new BadRequestException('error_volunteer_joined_event');
      }
    } else {
      throw new BadRequestException('error_limited_number_of_participants');
    }
  }

  async unJoinEvent(id: string, user) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('cannot_found_event');
    }
    const userId = user._id || user.id;
    // Check join event
    const joined = await this.eventAttendeesModel.findOneAndDelete({eventId: event._id, userId: userId});
    if (joined) {
      event.countAttended = event.countAttended > 0 ? event.countAttended - 1 : 0;
      event.save();
      return true;
    } else {
      throw new BadRequestException('error_volunteer_cannot_join_event');
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.eventModel.findByIdAndUpdate(id, updateEventDto).setOptions({ new: true });

    if (!event) {
      throw new UnprocessableEntityException('error_when_update_camp');
    }

    return event;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }

  _setAttendees(event, attendes) {
    const cloned = event.toObject({getters: true, versionKey: false});
    cloned._id = cloned.id
    delete cloned.id
    cloned['attendes'] = attendes;

    return cloned;
  }

  _buildConditions(query) {
    type Conditions = {
        title: string;
        description: string;
        location: any
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

    if (query.lat && query.lng) {
      conditions.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [query.lng, query.lat]
          },
          $maxDistance: 50000
        }
      }
      if (query.maxDistance) {
        conditions.location.$near.$maxDistance = query.maxDistance;
      }
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
