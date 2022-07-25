import { IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { UserExists } from 'src/validation/user-exists-rule.validate';
export class CreateOriganizationDto {
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
  @IsOptional()
  @ApiProperty({
    example: '0987654321',
    description: 'The desc of origanization',
  })
  phone: string;

  @IsEmail()
  @IsString()
  @UserExists()
  @ApiProperty({
    example: 'outstreach@org.com',
    description: 'The email of origanization',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: '123456',
    description: 'The password of account',
    required: true,
  })
  password: string;

  status: number;

  code: string;
}
