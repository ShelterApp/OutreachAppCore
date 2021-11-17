import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { SupplyItemStatus, SupplyStatus } from "src/enum";
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Organization } from "src/organizations/schema/organization.schema";
import { Supply } from "./supply.schema";


export type SupplyItemDocument = SupplyItem & Document;

@Schema()
export class SupplyItem {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Organization.name, required: true })
    @Type(() => Organization)
    organizationId: Organization;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Supply.name, required: true })
    @Type(() => Supply)
    supplyId: Supply;

    @Prop({type: Number, required: true})
    qty: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;

}

export const SupplyItemSchema = SchemaFactory.createForClass(SupplyItem).plugin(softDeletePlugin);

SupplyItemSchema.index({ qty: 1 });
SupplyItemSchema.index({ organizationId: 1 });
SupplyItemSchema.index({ supplyId: 1 });