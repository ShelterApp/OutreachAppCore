import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Supply } from "src/supplies/schema/supply.schema";
import { LocationDto } from "src/utils/dto/location.dto";
import { Category } from "../../categories/shema/category.schema";


export class CreateSupplyListDto {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'Supply id', required: true })
    supplyId: Supply;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'Supply name', required: true })
    supplyName: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'Supply name', required: true })
    qty: number;
}

export class CreateCampRequestDto {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'The camp request', required: true })
    campId: string;

    @ValidateNested()
    @IsOptional()
    @Type(() => CreateSupplyListDto)
    @ApiProperty({ type: ()  => [CreateSupplyListDto] , description: 'supplies request', required: true })
    supplies: CreateSupplyListDto[]
}

