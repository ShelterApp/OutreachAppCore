import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePageDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "About", description: 'The title', required: false })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "about_us", description: 'Identifier', required: false })
    identifier: string;

    @IsString()
    @ApiProperty({ example: "About us Content", description: 'The content', required: false })
    content: string;

    @IsOptional()
    createdAt: Date;

    @IsOptional()
    updatedAt: Date;
}
