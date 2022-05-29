
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
export type OrganizationDocument = Organization & Document;

@Schema()
export class Organization {
  @Prop({ type: String, maxlength: 8, minlength: 6, required: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String] })
  address: string[];

  @Prop({ type: String })
  city: string;

  @Prop({ type: Number })
  postcode: number;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: Number })
  lat: number;

  @Prop({ type: Number })
  lng: number;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: Number, default: 1 }) // 1: enabled, 3: disabled
  status: number;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization).plugin(softDeletePlugin);

OrganizationSchema.index({ name: 'text' });
OrganizationSchema.index({ code: 1 });
OrganizationSchema.index({ email: 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ lat: 1, lng: 1 });

OrganizationSchema.index({ createdAt: 1 });
OrganizationSchema.index({ updatedAt: 1 });