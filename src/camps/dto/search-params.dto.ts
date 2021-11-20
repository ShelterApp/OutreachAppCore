import { IsNumber, Min, IsOptional, IsString, IsMongoId, isNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CampStatus, CampType } from 'src/enum';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, description)', required:false })
  keyword: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: [1,3], description: 'Filter by type (Pet: 1, Parking: 3)', required:false })
  type: CampType;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: [1,3,5,7], description: 'Filter by status: enum(Actived = 1,Inactive = 3,Lostinsweet = 5)', required:false })
  status: CampStatus;

  @IsOptional()
  @IsNumber()
  @Transform(({value}) => Number.parseFloat(value))
  @ApiProperty({ example: 106.7013723, description: 'Long', required:false })
  lng: number;

  @IsOptional()
  @IsNumber()
  @Transform(({value}) => Number.parseFloat(value))
  @ApiProperty({ example: 10.7974046, description: 'Lat', required:false })
  lat: number;

  @IsOptional()
  @IsNumber()
  @Transform(({value}) => Number.parseFloat(value))
  @ApiProperty({ example: 50000, description: 'max distance default 50km', required:false })
  maxDistance: number;
}