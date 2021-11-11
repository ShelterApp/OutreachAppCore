import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateOriganizationDto {

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

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1, description: 'The status of origanization . 1: enabled, 3: disabled'})
    status: number;
}