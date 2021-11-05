import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Type } from 'class-transformer';

export type RegionDocument = Region & Document;

@Schema()
export class Region {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Region.name, default: null })
    @Type(() => Region)
    parentId: Region;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    code: string;

    @Prop({type: Number, required: false})
    lat: number;

    @Prop({type: Number, required: false})
    lng: number;

    @Prop({type: Number, default: 1}) // 1: enabled, 3: disabled
    status: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const RegionSchema = SchemaFactory.createForClass(Region).plugin(softDeletePlugin);

RegionSchema.index({ name: 'text' });
RegionSchema.index({ code: 1 });
RegionSchema.index({ parentId: 1 });
RegionSchema.index({ status: 1 });
RegionSchema.index({ lat: 1, lng: 1 });

RegionSchema.index({ createdAt: 1 });
RegionSchema.index({ updatedAt: 1 });