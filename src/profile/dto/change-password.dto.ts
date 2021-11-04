import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, IsMongoId, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from 'src/validation/match.validate';
export class ChangePasswordDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty({ example: "123456", description: 'Old password', required: true })
    oldPassword: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: "456789", description: 'New password', required: true })
    newPassword: string;

    @IsString()
    @MinLength(6)
    @Match('newPassword')
    @ApiProperty({ example: "456789", description: 'Confirmation password', required: true })
    confirmPassword: string
}