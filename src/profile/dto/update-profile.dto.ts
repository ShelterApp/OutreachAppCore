import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValidById } from 'src/validation/organization-validbyid-rule.validate';
import { RegionValid } from 'src/validation/region-valid-rule.validate';
import { Region } from 'src/regions/schema/region.schema';
export class UpdateProfileDto {

    @IsMongoId()
    @IsNotEmpty()
    @RegionValid()
    @ApiProperty({ example: "", description: 'The city', required: false })
    regionId: Region;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: true })
    phone: string;

    @IsOptional()
    @IsMongoId()
    @OrganizationValidById()
    @ApiProperty({ example: "id organization", description: 'Org', required: false })
    organizationId: Organization
}