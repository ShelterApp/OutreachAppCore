import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as mongoose from 'mongoose';
import { RequestStatus, RequestType } from 'src/enum';
import { User } from '../../users/schema/user.schema';

export type RequestDocument = Request & Document;

@Schema()
export class Request {

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: false, default: null})
    description: string;

    @Prop({type: Number, required: true})
    type: RequestType;

    @Prop({ type: String, required: false, default: null })
    address: string;

    @Prop({type: Number, required: false, default: 0})
    lat: number;

    @Prop({type: Number, required: false, default: 0})
    lng: number;

    @Prop({type: Number, default: 1})
    status: RequestStatus;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;

    @Prop({ type: Date, default: null })
    processAt: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false, default: null })
    processBy: User;
}

export const RequestSchema = SchemaFactory.createForClass(Request).plugin(softDeletePlugin);

RequestSchema.index({ externalId: 1 });
RequestSchema.index({ type: 1 });
RequestSchema.index({ status: 1 });

RequestSchema.index({ createdAt: 1 });
RequestSchema.index({ processAt: 1 });
RequestSchema.index({ processBy: 1 });