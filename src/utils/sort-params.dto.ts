import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class SortParams {
  @IsOptional()
  @ApiProperty({ example: 0, description: 'Sort by field', required:false })
  @Transform(({value}) => Number.parseInt(value))
  sortBy: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: ['desc', 'asc'], description: 'Sort type', required:false })
  sortType: string;
}