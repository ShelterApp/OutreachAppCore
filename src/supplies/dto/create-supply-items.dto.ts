import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, MinLength, MaxLength, IsMongoId, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '../..//organizations/schema/organization.schema';
import { Supply } from '../schema/supply.schema';
import { Type } from 'class-transformer';
export class CreateSupplyItemsDto {

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "617ff83996b51c393f5162f3", description: 'The id of orgnazation', required: true })
    organizationId: Organization

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => SuppliesDto)
    @ApiProperty({ type: ()  => [SuppliesDto] , description: 'Supply list', required: true })
    supplyItems: SuppliesDto[]
}


export class SuppliesDto {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "mongo id", description: 'The id of supplies', required: true })
    supplyId: Supply

    @IsNumber()
    @Min(0)
    @ApiProperty({ example: 1, description: 'The quantity of supplies items' })
    qty: number;
}