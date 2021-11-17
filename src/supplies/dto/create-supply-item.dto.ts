import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, MinLength, MaxLength, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../..//organizations/schema/organization.schema';
import { Supply } from '../schema/supply.schema';
export class CreateSupplyItemDto {

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "mongo id", description: 'The id of orgnazation', required: true })
    organizationId: Organization

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "mongo id", description: 'The id of supplies', required: true })
    supplyId: Supply

    @IsNumber()
    @Min(0)
    @ApiProperty({ example: 1, description: 'The quantity of supplies items' })
    qty: number;
}
