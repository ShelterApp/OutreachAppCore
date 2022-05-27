import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class UpdateOriganizationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'OutStreach Org',
    description: 'The name of origanization',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    example:
      'OutStreach Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    description: 'The desc of origanization',
  })
  description: string;

  @IsString()
  @ApiProperty({ example: 'Address', description: 'The desc of origanization' })
  address: string;

  @IsString()
  @IsPhoneNumber('US')
  @ApiProperty({
    example: '0987654321',
    description: 'The desc of origanization',
  })
  phone: string;

  @IsString()
  @MinLength(1)
  @MaxLength(6)
  @ApiProperty({ example: '111111', description: 'The desc of origanization' })
  code: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'The status of origanization . 1: enabled, 3: disabled',
  })
  status: number;
}
