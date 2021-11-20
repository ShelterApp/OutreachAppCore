import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as mongoose from 'mongoose';
import { CampStatus, CampType, Gender } from '../../enum';
import { User } from '../../users/schema/user.schema';

export type CampDocument = Camp & Document;

@Schema({_id: false})
export class People extends Document{

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: Number, default: 0})
    age: number;

    @Prop({type: Number, default: 1})
    gender: Gender;

    @Prop({type: Number, default: null})
    race: number;

    @Prop({type: Number, default: null})
    disabled: number;

    @Prop({type: Number, default: null})
    unhouseSince: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}
export const PeopleSchema = SchemaFactory.createForClass(People);


@Schema({_id: false})
export class Location extends Document{

    @Prop({type: String, required: true})
    type: string;

    @Prop({type: Array, default: 0})
    coordinates: number[];
}
export const LocationSchema = SchemaFactory.createForClass(Location);


@Schema()
export class Camp {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
    creator: User;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: false, default: null})
    description: string;

    @Prop({type: Number, required: false, default: 0})
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

    @Prop({type: Number, required: false, default: 0})
    numOfPet: number;

    @Prop({ type: [PeopleSchema] , required: false, default: null })
    people: People[];

    @Prop({type: Number, required: true})
    type: CampType;

    @Prop({type: Number, default: 1})
    status: CampStatus;

    @Prop({ type: String, required: false, default: null })
    address: string;

    @Prop({type: Location, required: false})
    location: Location

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const CampSchema = SchemaFactory.createForClass(Camp).plugin(softDeletePlugin);

CampSchema.index({ name: 'text' });
CampSchema.index({ type: 1 });
CampSchema.index({ status: 1 });

CampSchema.index({ createdAt: 1 });
CampSchema.index({ location: '2d' });
CampSchema.index({ address: 1 });