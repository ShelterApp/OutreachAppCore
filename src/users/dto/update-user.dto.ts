import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValid } from '../../validation/organization-valid-rule.validate';
import { UserExists } from '../../validation/user-exists-rule.validate';
import { OrganizationValidById } from 'src/validation/organization-validbyid-rule.validate';
import { RegionValid } from 'src/validation/region-valid-rule.validate';
import { Region } from 'src/regions/schema/region.schema';
export class UpdateUserDto {

    @IsMongoId()
    @IsNotEmpty()
    @RegionValid()
    @ApiProperty({ example: "", description: 'The city', required: false })
    regionId: Region;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: false })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: false })
    phone: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: UserRole.Volunteer, description: 'Type of user', required: false })
    userType: UserRole
    

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, type: 'number', description: 'Is verify email?', required: false })
    isVerify: number


    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: 'enum', example: 1, description: 'Status of user', required: false })
    status: number

    @IsOptional()
    @IsMongoId()
    @OrganizationValidById()
    organizationId: Organization
}