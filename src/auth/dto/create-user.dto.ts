import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from 'src/organizations/schema/organization.schema';
export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: true })
    phone: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "abc@gmail.com", description: 'The email of account', required: true })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "123456", description: 'The password of account', required: true })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "000111", description: 'The code of orgnazation', required: true })
    verificationCode: string;
    
    userType: String

    isVerify: Number

    organization: Organization
}