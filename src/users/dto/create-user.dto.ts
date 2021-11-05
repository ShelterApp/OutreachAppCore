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
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ example: "123456", description: 'The password of account', required: true })
    password: string;

    @IsString()
    @IsNotEmpty()
    @OrganizationValid()
    @ApiProperty({ example: "000111", description: 'The code of orgnazation', required: true })
    orgCode: string;
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: UserRole.Volunteer, description: 'Type of user', required: true })
    userType: string
    

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ example: 1, type: 'number', description: 'Is verify email?', required: true })
    isVerify: number


    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ type: 'enum', example: 1, description: 'Status of user', required: true })
    status: number

    @IsOptional()
    organizationId: Organization
}