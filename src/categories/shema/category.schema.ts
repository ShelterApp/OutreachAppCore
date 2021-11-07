import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Type } from 'class-transformer';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name, default: null })
    @Type(() => Category)
    parentId: Category;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: Number, default: 0}) // 1: enabled, 3: disabled
    displayOrder: number;

    @Prop({type: Number, default: 1}) // 1: enabled, 3: disabled
    status: number;

    @Prop({ type: Date, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now() })
    updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category).plugin(softDeletePlugin);

CategorySchema.index({ name: 'text' });
CategorySchema.index({ parentId: 1 });

CategorySchema.index({ createdAt: 1 });
CategorySchema.index({ updatedAt: 1 });