import { Optional } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateCampDto, CreatePeopleDto, LocationDto } from './create-camp.dto';

export class UpdateCampDto {
    @IsString()
    @Optional()
    @ApiProperty({ example: "Camp XYZ", description: 'The name of camp', required: true })
    name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "Description of Camp XYZ", description: 'Description', required: false })
    description: string

    @ValidateNested()
    @IsOptional()
    @ApiProperty({ type: ()  => [CreatePeopleDto] , description: 'People in camp', required: false })
    people: []

    @IsNumber()
    @Optional()
    @ApiProperty({ example: 1 , description: 'Number of people', default: 1, required: false })
    numOfPeople: number;

    @IsNumber()
    @Optional()
    @ApiProperty({ example: 1 , description: 'Number of pet', default: 1, required: false })
    numOfPet: number;

    @IsNumber()
    @Optional()
    @ApiProperty({ example: 1 , description: 'CampType {Pet = 1,Parking = 3}', required: false })
    type: number;

    @IsNumber()
    @Optional()
    @ApiProperty({ example: 1 , description: 'CampStatus{Actived = 1,Inactive = 3,Lostinsweet = 5} Default is active', default: 1, required: false })
    status: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'Newyork' , description: 'Address of user', required: false })
    address: string;


    @IsNotEmpty()
    @ApiProperty({description: 'GEO', required: false })
    location: LocationDto;
}
