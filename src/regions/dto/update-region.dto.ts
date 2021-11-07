import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { RegionUniqueByCode } from "../../validation/region-unique-by-code-rule.validate";
import { RegionValid } from "../../validation/region-valid-rule.validate";
import { Region } from "../schema/region.schema";

export class UpdateRegionDto {
    @IsNotEmpty()
    @IsMongoId()
    @RegionValid()
    @IsOptional()
    parentId: Region;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "San Jose", description: 'The name of region', required: true })
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "CR", description: 'The code of region', required: true })
    code: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 9.934739, description: 'Lat', required: false })
    lat: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: -84.087502, description: 'Long', required: false })
    lng: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: 'enum', example: 1, description: 'Status', required: true })
    status: number

}

