import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, IsMongoId, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from 'src/validation/match.validate';
export class ResetPasswordDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "token", description: 'Token reset password', required: true })
    token: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ example: "456789", description: 'new password', required: true })
    password: string;

    @IsString()
    @MinLength(6)
    @Match('password')
    @ApiProperty({ example: "456789", description: 'confirmation password', required: true })
    confirmPassword: string
}