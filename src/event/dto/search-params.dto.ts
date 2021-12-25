import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, description)', required:false })
  keyword: string;
}