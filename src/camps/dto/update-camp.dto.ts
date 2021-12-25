import { Optional } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '../../users/schema/user.schema';
import { LocationDto } from '../../utils/dto/location.dto';
import { CreateCampDto, CreatePeopleDto } from './create-camp.dto';

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
    @Type(() => CreatePeopleDto)
    @ApiProperty({ type: ()  => [CreatePeopleDto] , description: 'People in camp', required: true })
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
    @ApiProperty({ example: 1 , description: 'CampType {Camps = 1,CampWithPets = 3,RV = 5,SafeParking = 7,Other = 9,}', required: false })
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
    @Type(() => LocationDto)
    @ApiProperty({type: ()  => LocationDto, description: 'GEO', required: false })
    location: LocationDto;
    

    updatedBy: User;

    updatedAt: Date;
}
