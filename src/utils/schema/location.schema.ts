import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({_id: false})
export class Location extends Document{

    @Prop({type: String, required: true})
    type: string;

    @Prop({type: Array, default: 0})
    coordinates: number[];
}
export const LocationSchema = SchemaFactory.createForClass(Location);