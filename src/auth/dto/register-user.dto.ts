import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValid } from '../../validation/organization-valid-rule.validate';
import { UserExists } from '../../validation/user-exists-rule.validate';
export class RegisterUserDto {

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
    organization: Organization
}