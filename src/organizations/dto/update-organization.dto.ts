import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

  @IsOptional()
  @ApiProperty({
    type: [String],
    description: 'The addresses of origanization',
  })
  address: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Covington',
    description: 'The city of origanization',
  })
  city: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 12345,
    description: 'The post code of origanization',
  })
  postcode: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Louisiana',
    description: 'The state of origanization',
  })
  state: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'United States',
    description: 'The country of origanization',
  })
  country: string;

  @IsString()
  @IsOptional()
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
