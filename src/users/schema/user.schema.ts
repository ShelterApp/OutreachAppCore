import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { UserRole, UserVerify } from '../../enum';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Organization } from '../../organizations/schema/organization.schema';
import { ExcludeProperty } from 'nestjs-mongoose-exclude';

export type UserDocument = User & Document;

@Schema()
export class User {

    @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
    organization: Organization;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    email: string;

    @Prop({type: String, required: true})
    @ExcludeProperty()
    password: string;

    @Prop({type: String, default: UserRole.Volunteer})
    userType: UserRole;

    @Prop({type: Number, default: 1}) // 1: enabled, 3: disabled
    status: number;

    @Prop({type: Number, default: UserVerify.Unverified})
    isVerify: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;

    @Prop({ type: Date, default: null })
    lastedLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User).plugin(softDeletePlugin);