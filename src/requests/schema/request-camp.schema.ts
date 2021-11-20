import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/shema/category.schema';
import * as mongoose from 'mongoose';
import { Request } from './request.schema';
import { Type } from 'class-transformer';
import { Location } from '../../utils/schema/location.schema';
import { Camp } from '../../camps/schema/camp.schema';
import { Supply } from 'src/supplies/schema/supply.schema';

export type RequestCampDocument = RequestCamp & Document;

@Schema({_id: false})
export class SupplyList {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Supply.name, required: true })
    @Type(() => Supply)
    supplyId: Supply;

    @Prop({type: String, required: true, default: ''})
    supplyName: string;

    @Prop({type: Number, required: true, default: 0})
    qty: number;
}
export const SupplyListSchema = SchemaFactory.createForClass(SupplyList);
@Schema()
export class RequestCamp {
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Request.name, required: true })
    requestId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Camp.name, required: true })
    campId: mongoose.Schema.Types.ObjectId;

    @Prop({type: [SupplyListSchema], required: true})
    supplies: SupplyList[];
}

export const RequestCampSchema = SchemaFactory.createForClass(RequestCamp);

RequestCampSchema.index({ requestId: 1 });
RequestCampSchema.index({ campId: 1 });
