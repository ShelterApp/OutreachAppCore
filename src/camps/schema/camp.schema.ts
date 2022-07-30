import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as mongoose from 'mongoose';
import { CampStatus, CampType, Gender } from '../../enum';
import { User } from '../../users/schema/user.schema';
import { Location, LocationSchema } from '../../utils/schema/location.schema';
export type CampDocument = Camp & Document;

@Schema({_id: false})
export class People extends Document{

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: Number, default: 0})
    age: number;

    @Prop({type: String, default: 1})
    gender: string;

    @Prop({type: String, default: null})
    race: string;

    @Prop({type: String, default: null})
    disabled: string;

    @Prop({type: String, default: null})
    unhouseSince: string;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}
export const PeopleSchema = SchemaFactory.createForClass(People);
@Schema()
export class Camp {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false, default: null })
  description: string;

  @Prop({ type: Number, required: false, default: 0 })
  numOfPeople: number;

  @Prop({
    get: (numOfPet: number) => {
      if (!numOfPet) {
        return false;
      }
      return numOfPet > 0;
    },
  })
  hasPet?: string;

  @Prop({ type: Number, required: false, default: 0 })
  numOfPet: number;

  @Prop({ type: [PeopleSchema], required: false, default: null })
  people: People[];

  @Prop({ type: Number, required: true })
  type: CampType;

  @Prop({ type: Number, default: 1 })
  status: CampStatus;

  @Prop({ type: String, required: false, default: null })
  address: string;

  @Prop({ type: String, required: false, default: null })
  city: string;

  @Prop({ type: String, required: false, default: null })
  postcode: string;

  @Prop({ type: String, required: false, default: null })
  state: string;

  @Prop({ type: String, required: false, default: null })
  country: string;

  @Prop({ type: LocationSchema, required: false })
  location: Location;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  createdBy: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
    default: null,
  })
  updatedBy: User;
}

export const CampSchema = SchemaFactory.createForClass(Camp).plugin(softDeletePlugin);

CampSchema.index({ name: 'text' });
CampSchema.index({ type: 1 });
CampSchema.index({ status: 1 });

CampSchema.index({ createdAt: 1 });
CampSchema.index({ location: '2dsphere' });
CampSchema.index({ address: 1 });