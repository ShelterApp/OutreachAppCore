import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    description: 'The addresses of origanization',
  })
  address: string[];

  @IsString()
  @ApiPropertyOptional({
    example: 'Covington',
    description: 'The city of origanization',
  })
  city: string;

  @IsNumber()
  @ApiPropertyOptional({
    example: 12345,
    description: 'The post code of origanization',
  })
  postcode: number;

  @IsString()
  @ApiPropertyOptional({
    example: 'Louisiana',
    description: 'The state of origanization',
  })
  state: string;

  @IsString()
  @ApiPropertyOptional({
    example: 'United States',
    description: 'The country of origanization',
  })
  country: string;

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
