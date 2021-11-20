import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/shema/category.schema';
import * as mongoose from 'mongoose';
import { Request } from './request.schema';
import { Type } from 'class-transformer';
import { Location } from '../../utils/schema/location.schema';

export type RequestUserDocument = RequestUser & Document;
@Schema({_id: false})
export class Cate extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: false })
  @Type(() => Category)
  parentCateId: Category;

  @Prop({ type: String, required: false })
  parentCateName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: false })
  @Type(() => Category)
  subCateId: Category;

  @Prop({ type: String, required: false })
  subCateName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, required: false })
  @Type(() => Category)
  sizeCateId: Category;

  @Prop({ type: String, required: false })
  sizeCateName: string;
}

@Schema()
export class RequestUser {
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Request.name, required: true })
    requestId: mongoose.Schema.Types.ObjectId;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    email: string;

    @Prop({ type: String, required: true })
    phone: string;

    @Prop({ type: String, required: false, default: null })
    note: string;

    @Prop({ type: Cate, required: false, default: null })
    cate: Cate;

    @Prop({ type: String, required: false, default: null })
    address: string;

    @Prop({type: Location, required: false})
    location: Location
}

export const RequestUserSchema = SchemaFactory.createForClass(RequestUser);

RequestUserSchema.index({ name: 'text' });
RequestUserSchema.index({ email: 1 });
RequestUserSchema.index({ phone: 1 });

RequestUserSchema.index({ location: '2dsphere' });