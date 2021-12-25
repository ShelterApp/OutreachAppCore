import { IsString, IsEmail, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schema/user.schema';
import { IsDateTime } from '../../validation/datetime.validate';
import { IsBeforeDate } from '../../validation/before-date.validate';
import { LocationDto } from '../../utils/dto/location.dto';
import { Type } from 'class-transformer';
export class UpdateEventDto {

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "Agape silicon valley", description: 'The title of event', required: true })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "Agape silicon valley event description", description: 'The description of event', required: true })
    description: string;

    @IsDateTime()
    @IsOptional()
    @IsString()
    @IsBeforeDate('endDate')
    @ApiProperty({ example: "2021-12-11 11:00", description: 'Start event at ... format (YYYY-MM-DD HH:mm)', required: true })
    startDate: Date;

    @IsDateTime()
    @IsOptional()
    @IsString()
    @ApiProperty({ example: "2021-12-15 11:00", description: 'End event at ... format (YYYY-MM-DD HH:mm)', required: true })
    endDate: Date;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "0987654321", description: 'Contact Phone', required: true })
    contactPhone: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    @ApiProperty({ example: "contact@gmail.com", description: 'Contact Email', required: true })
    contactEmail: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: "London", description: 'Address of event', required: true })
    address: string;

    @IsOptional()
    location: LocationDto;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 20, description: 'Maximum attended', required: true })
    maxAttended: number;

    @IsOptional()
    updatedAt: Date;

    @IsOptional()
    updatedBy: User;
}
