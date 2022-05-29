import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from "class-transformer";
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Supply } from 'src/supplies/schema/supply.schema';
import { User } from '../../users/schema/user.schema';
import { LocationDto } from '../../utils/dto/location.dto';

export class CreatePeopleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Seven',
    description: 'Name of people',
    required: true,
  })
  name: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 18, description: 'Age', required: true })
  age: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Male',
    description:
      'Gender (Male, Female, Non-binary, Prefer to self-disclose, Prefer not to answer)',
    required: true,
  })
  gender: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Asian',
    description:
      '"American Indian or Alaska Native", "Asian", "Black or African American", "Hispanic or Latino", "Native Hawaiian or Other Pacific Islander", "White"',
    required: false,
  })
  race: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'No', description: 'Yes/No', required: false })
  disabled: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '1 year',
    description: 'Less than an year,  1 year, 2 year',
    required: false,
  })
  unhouseSince: string;
}
export class CreateCampDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Camp XYZ',
    description: 'The name of camp',
    required: true,
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Description of Camp XYZ',
    description: 'Description',
    required: false,
  })
  description: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreatePeopleDto)
  @ApiProperty({
    type: () => [CreatePeopleDto],
    description: 'People in camp',
    required: true,
  })
  people: CreatePeopleDto[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'Number of people',
    default: 1,
    required: true,
  })
  numOfPeople: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'Number of pet',
    default: 1,
    required: true,
  })
  numOfPet: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description:
      'CampType {Camps = 1,CampWithPets = 3,RV = 5,SafeParking = 7,Other = 9}',
    required: true,
  })
  type: number;

  @IsNumber()
  @Optional()
  @ApiProperty({
    example: 1,
    description:
      'CampStatus{Actived = 1,Inactive = 3,Lostinsweet = 5} Default is active',
    default: 1,
    required: true,
  })
  status: number;

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

  @IsNotEmpty()
  @ApiProperty({ type: () => LocationDto, description: 'GEO', required: false })
  location: LocationDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateSupplyListDto)
  @ApiProperty({
    type: () => [CreateSupplyListDto],
    description: 'supplies request',
    required: true,
  })
  requestSupplies: CreateSupplyListDto[];

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateSupplyListDto)
  @ApiProperty({
    type: () => [CreateSupplyListDto],
    description: 'drop request',
    required: true,
  })
  dropSupplies: CreateSupplyListDto[];

  createdBy: User;
}


export class CreateSupplyListDto {
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'Supply id', required: true })
    supplyId: Supply;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "", description: 'Supply name', required: true })
    supplyName: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'Supply name', required: true })
    qty: number;
}