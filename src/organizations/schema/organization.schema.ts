
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
export type OrganizationDocument = Organization & Document;

@Schema()
export class Organization {
    @Prop({type: String, maxlength: 8, minlength: 6, required: true})
    code: string;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String})
    description: string;

    @Prop({type: String})
    address: string;

    @Prop({type: Number})
    lat: number;

    @Prop({type: Number})
    lng: number;

    @Prop({type: String})
    email: string;

    @Prop({type: String})
    phone: string;

    @Prop({type: Number, default: 1}) // 1: enabled, 3: disabled
    status: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization).plugin(softDeletePlugin);