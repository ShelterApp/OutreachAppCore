import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageDocument = Page & Document;

@Schema()
export class Page {

    @Prop({type: String, required: true})
    title: string;

    @Prop({type: String, required: true})
    identifier: string;

    @Prop({type: String, required: false})
    content: string;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

PageSchema.index({ title: 'text' });
PageSchema.index({ identifier: 1 });

PageSchema.index({ createdAt: 1 });
PageSchema.index({ updatedAt: 1 });