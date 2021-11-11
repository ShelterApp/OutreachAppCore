import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword', required:false })
  keyword: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Filter by code', required:false })
  code: string;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({ description: 'Filter by parent id', required:false })
  parentId: string;
}