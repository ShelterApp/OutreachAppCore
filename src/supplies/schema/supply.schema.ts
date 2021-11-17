import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import * as mongoose from 'mongoose';
import { SupplyStatus } from "src/enum";
import { Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';

export type SupplyDocument = Supply & Document;

@Schema()
export class Supply {

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, default: ''})
    description: string;

    @Prop({type: Number, default: SupplyStatus.Enabled}) // 1: enabled, 3: disabled
    status: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;

}

export const SupplySchema = SchemaFactory.createForClass(Supply).plugin(softDeletePlugin);

SupplySchema.index({ status: 1 });
SupplySchema.index({ name: 'text' });