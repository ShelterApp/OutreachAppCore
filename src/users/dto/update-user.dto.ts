import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValid } from '../../validation/organization-valid-rule.validate';
import { UserExists } from '../../validation/user-exists-rule.validate';
export class UpdateUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: true })
    phone: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: UserRole.Volunteer, description: 'Type of user', required: true })
    userType: UserRole
    

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, type: 'number', description: 'Is verify email?', required: true })
    isVerify: number


    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: 'enum', example: 1, description: 'Status of user', required: true })
    status: number

    @IsOptional()
    organization: Organization
}