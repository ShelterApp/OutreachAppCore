import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Category } from "../shema/category.schema";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsMongoId()
    @IsOptional()
    parentId: Category;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Ourdoor gear", description: 'The name of category', required: true })
    name: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 0, description: 'Display order', required: true })
    displayOrder: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: 'enum', example: 1, description: 'Status', required: true })
    status: number
}

