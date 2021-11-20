import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { User } from "../../users/schema/user.schema";

export class CreatePeopleDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Seven", description: 'Name of people', required: true })
    name: string;

    @IsNumber()
    @ApiProperty({ example: 18, description: 'Age', required: true })
    age: number;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'Gender (1: Men, 3: Women, 5: Unknown)', required: true })
    gender: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1, description: 'Unknown', required: false })
    race: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1, description: 'Unknown', required: false })
    disabled: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 1991, description: 'Unknown', required: false })
    unhouseSince: number;
}

export class LocationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Point", description: 'Location type', required: false })
    type: string;

    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ example: [-73.97, 40.77], description: '[Long, Lat]', required: false })
    coordinates: number[];
}

export class CreateCampDto {
    @IsString()
    @IsNotEmpty()
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
    people: CreatePeopleDto[]

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1 , description: 'Number of people', default: 1, required: true })
    numOfPeople: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1 , description: 'Number of pet', default: 1, required: true })
    numOfPet: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1 , description: 'CampType {Pet = 1,Parking = 3}', required: true })
    type: number;

    @IsNumber()
    @Optional()
    @ApiProperty({ example: 1 , description: 'CampStatus{Actived = 1,Inactive = 3,Lostinsweet = 5} Default is active', default: 1, required: true })
    status: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'Newyork' , description: 'Address of user', required: false })
    address: string;


    @IsNotEmpty()
    @ApiProperty({description: 'GEO', required: false })
    location: LocationDto;


    creator: User;
}
