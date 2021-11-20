import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class LocationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Point", description: 'Location type', required: false })
    type: string;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ example: [-73.97, 40.77], description: '[Long, Lat]', required: false })
    coordinates: number[];
}