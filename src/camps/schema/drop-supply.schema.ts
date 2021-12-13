import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { Camp } from './camp.schema';
import { Supply } from 'src/supplies/schema/supply.schema';
import { User } from '../../users/schema/user.schema';
import { Organization } from '../../organizations/schema/organization.schema';

export type DropSupplyDocument = DropSupply & Document;

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
export class DropSupply {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Camp.name, required: true })
    campId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Organization.name, required: false })
    organizationId: mongoose.Schema.Types.ObjectId;

    @Prop({type: [SupplyListSchema], required: true})
    supplies: SupplyList[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false, default: null })
    createdBy: User;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const DropSupplySchema = SchemaFactory.createForClass(DropSupply);

DropSupplySchema.index({ campId: 1 });
