import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserExists } from 'src/validation/user-exists-rule.validate';
export class CreateOriganizationDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach Org", description: 'The name of origanization', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "OutStreach Lorem ipsum dolor sit amet, consectetur adipiscing elit", description: 'The desc of origanization' })
    description: string;

    @IsString()
    @ApiProperty({ example: "Address", description: 'The desc of origanization'})
    address: string;

    @IsString()
    @MinLength(8)
    @MaxLength(12)
    @ApiProperty({ example: "0987654321", description: 'The desc of origanization' })
    phone: string;

    @IsEmail()
    @IsString()
    @UserExists()
    @ApiProperty({ example: "outstreach@org.com", description: 'The email of origanization'})
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ example: "123456", description: 'The password of account', required: true })
    password: string;

    status: number;

    code: string;
}