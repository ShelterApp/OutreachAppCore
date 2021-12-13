import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Type } from 'class-transformer';
import { Supply } from 'src/supplies/schema/supply.schema';
import { User } from 'src/users/schema/user.schema';

export type SupplyTransactionDocument = SupplyTransaction & Document;
@Schema()
export class SupplyTransaction {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Supply.name, required: true })
    @Type(() => Supply)
    supplyId: Supply;

    @Prop({type: String, required: true, default: ''})
    supplyName: string;

    @Prop({type: Number, required: true, default: 0})
    qty: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    organizationId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    externalId: mongoose.Schema.Types.ObjectId;

    @Prop({type: Number, required: true, default: 1})
    type: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false, default: null })
    createdBy: User;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const SupplyTransactionSchema = SchemaFactory.createForClass(SupplyTransaction);

SupplyTransactionSchema.index({ campId: 1 });
