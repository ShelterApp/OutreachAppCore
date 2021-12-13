import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, description)', required:false })
  keyword: string;

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