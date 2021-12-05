import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { Camp } from '../../camps/schema/camp.schema';

export type CampLogDocument = CampLog & Document;

@Schema({_id: false})
export class Item extends Document{
    @Prop({type: String, required: true, default: ''})
    name: string;

    @Prop({type: Number, required: false, default: 0})
    qty: number;
}

@Schema()
export class CampLog {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Camp.name, default: null })
    campId: Camp;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
    userId: User;

    @Prop({type: String, required: false, default: null})
    fullname: string;

    @Prop({type: String, required: false, default: null})
    action: string;

    @Prop({type: Item, required: false, default: 0})
    items: [Item];

    @Prop({ type: String, required: false, default: null })
    message: string;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;
}

export const CampLogSchema = SchemaFactory.createForClass(CampLog).plugin(softDeletePlugin);

CampLogSchema.index({ fullname: 'text' });
CampLogSchema.index({ campId: 1 });
CampLogSchema.index({ userId: 1 });

CampLogSchema.index({ createdAt: 1 });