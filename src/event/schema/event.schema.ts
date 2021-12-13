import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from "src/users/schema/user.schema";
import { Location, LocationSchema } from "../../utils/schema/location.schema";
import { EventAttendees, EventAttendeesSchema } from "./event-attendees.schema";

export type EventDocument = Event & Document;

@Schema()
export class Event {

    @Prop({type: String, required: true})
    title: string;

    @Prop({type: String, default: ''})
    description: string;

    @Prop({type: Date}) // 1: enabled, 3: disabled
    startDate: Date;

    @Prop({ type: Date})
    endDate: Date;

    @Prop({type: String, default: ''})
    contactPhone: string;

    @Prop({type: String, default: ''})
    contactEmail: string;

    @Prop({type: String, default: ''})
    address: string;

    @Prop({type: LocationSchema, required: false})
    location: Location

    @Prop({type: Number, default: 0})
    countAttended: number;

    @Prop({type: Number, default: 0})
    maxAttended: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    createdBy: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false, default: null })
    updatedBy: User;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event).plugin(softDeletePlugin);

EventSchema.index({ startDate: 1 });
EventSchema.index({ endDate: 1 });
EventSchema.index({ createdAt: 1 });
EventSchema.index({ maxAttended: 1 });
EventSchema.index({ title: 'text' });
EventSchema.index({ location: '2dsphere' });