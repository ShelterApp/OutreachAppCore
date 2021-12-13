import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from "../../users/schema/user.schema";
import { Event } from "./event.schema";

export type EventAttendeesDocument = EventAttendees & Document;

@Schema()
export class EventAttendees {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Event.name, required: true })
    eventId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: string;

    @Prop({type: String, default: ''})
    userName: string;

    @Prop({type: String, default: ''})
    userPhone: string;

    @Prop({type: String, default: ''})
    userEmail: string;

    @Prop({type: Date}) // 1: enabled, 3: disabled
    attendedAt: Date;
}

export const EventAttendeesSchema = SchemaFactory.createForClass(EventAttendees).plugin(softDeletePlugin);

EventAttendeesSchema.index({ eventId: 1 });
EventAttendeesSchema.index({ userId: 1 });
EventAttendeesSchema.index({ attendedAt: 1 });