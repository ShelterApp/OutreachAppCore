import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Organization } from 'src/organizations/schema/organization.schema';
import { Region } from 'src/regions/schema/region.schema';
import { RegionValid } from 'src/validation/region-valid-rule.validate';
import { UserRole } from '../../enum';
import { OrganizationValidById } from '../../validation/organization-validbyid-rule.validate';
import { UserExists } from '../../validation/user-exists-rule.validate';
import { User } from '../schema/user.schema';
export class CreateUserDto {
  @IsMongoId()
  @IsNotEmpty()
  @RegionValid()
  @ApiProperty({ example: '', description: 'The city', required: true })
  regionId: Region;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Outreach',
    description: 'The name of person',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '099999999',
    description: 'The phone of person',
    required: true,
  })
  phone: string;

  @IsEmail()
  @IsString()
  @UserExists()
  @IsNotEmpty()
  @ApiProperty({
    example: 'abc@gmail.com',
    description: 'The email of account',
    required: true,
  })
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsMongoId()
  @IsNotEmpty()
  @OrganizationValidById()
  @ApiProperty({
    example: 'mongo id',
    description: 'The id of orgnazation',
    required: true,
  })
  organizationId: Organization;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: UserRole.Volunteer,
    description: 'Type of user',
    required: true,
  })
  userType: string & UserRole;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  isVerify: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status: number;

  @IsOptional()
  createdBy: User;
}
