import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schema/user.schema';
import { AuditLogAction, AuditLogType } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';

export type AuditlogDocument = Auditlog & Document;

@Schema({_id: false})
export class Item extends Document{
    @Prop({type: String, required: true, default: ''})
    name: string;

    @Prop({type: Number, required: false, default: 0})
    qty: number;
}

@Schema()
export class Auditlog {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
    userId: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Organization.name, default: null })
    orgId: Organization;

    @Prop({type: String, required: false, default: null})
    action: AuditLogAction;

    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null })
    objectId: String;

    @Prop({type: String, required: false, default: null})
    type: AuditLogType;

    @Prop({type: Array, required: false, default: null})
    items: [];

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;
}

export const AuditlogSchema = SchemaFactory.createForClass(Auditlog);

AuditlogSchema.index({ campId: 1 });
AuditlogSchema.index({ userId: 1 });
AuditlogSchema.index({ orgId: 1 });
AuditlogSchema.index({ objectId: 1 });

AuditlogSchema.index({ createdAt: 1 });