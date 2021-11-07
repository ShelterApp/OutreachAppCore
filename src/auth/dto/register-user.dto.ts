import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, MinLength, IsMongoId, ValidationArguments, MaxLength } from 'class-validator';
import { ApiBadRequestResponse, ApiProperty } from '@nestjs/swagger';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValid } from '../../validation/organization-valid-rule.validate';
import { UserExists } from '../../validation/user-exists-rule.validate';
import { RegionValid } from '../../validation/region-valid-rule.validate';
import { Region } from 'src/regions/schema/region.schema';
export class RegisterUserDto {

    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'The city', required: true })
    regionId: Region;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @MinLength(8)
    @MaxLength(12)
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
    @IsOptional()
    userType: String

    @IsNumber()
    @IsOptional()
    isVerify: Number
    
    @IsOptional()
    organizationId: Organization
}