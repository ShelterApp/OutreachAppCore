import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { UserRole, UserVerify } from '../../enum';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Organization } from '../../organizations/schema/organization.schema';
import { ExcludeProperty } from 'nestjs-mongoose-exclude';
import { Region, RegionSchema } from 'src/regions/schema/region.schema';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Region.name,
    default: null,
  })
  @Type(() => Region)
  regionId: Region;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization.name,
    default: null,
  })
  @Type(() => Organization)
  organizationId: Organization;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: false })
  phone: string;

  @Prop({ type: String, required: false })
  @ExcludeProperty()
  password: string;

  @Prop({ type: String, default: UserRole.Volunteer })
  userType: UserRole;

  @Prop({ type: Number, default: 1 }) // 1: enabled, 3: disabled
  status: number;

  @Prop({ type: Number, default: UserVerify.Unverified })
  isVerify: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy: User;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  lastedLoginAt: Date;
}

export const UserSchema =
  SchemaFactory.createForClass(User).plugin(softDeletePlugin);

UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ regionId: 1 });
UserSchema.index({ phone: 'text' });
UserSchema.index({ name: 'text' });
UserSchema.index({ name: 'text', email: 1 });

UserSchema.index({ createdAt: 1 });
UserSchema.index({ updatedAt: 1 });
