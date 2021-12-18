import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, Min, MinLength, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus, UserVerify } from '../../enum';
import { UserExists } from '../../validation/user-exists-rule.validate';
import { ObjectId } from 'mongoose';
import { OrganizationValidById } from '../../validation/organization-validbyid-rule.validate';
import { OrganizationValid } from 'src/validation/organization-valid-rule.validate';
import { Organization } from 'src/organizations/schema/organization.schema';
import { Type } from 'class-transformer';
import { RegionValid } from 'src/validation/region-valid-rule.validate';
import { Region } from 'src/regions/schema/region.schema';
export class CreateUserDto {

    @IsMongoId()
    @IsNotEmpty()
    @RegionValid()
    @ApiProperty({ example: "", description: 'The city', required: true })
    regionId: Region;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: true })
    phone: string;

    @IsEmail()
    @IsString()
    @UserExists()
    @IsNotEmpty()
    @ApiProperty({ example: "abc@gmail.com", description: 'The email of account', required: true })
    email: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsMongoId()
    @IsNotEmpty()
    @OrganizationValidById()
    @ApiProperty({ example: "mongo id", description: 'The id of orgnazation', required: true })
    organizationId: Organization
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: UserRole.Volunteer, description: 'Type of user', required: true })
    userType: string
    

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    isVerify: number


    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    status: number
}