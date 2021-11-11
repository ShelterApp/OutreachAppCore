import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, email, phone)', required:false })
  keyword: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Filter by email', required:false })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Filter by phone', required:false })
  phone: string;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({ description: 'Filter by Organization Id', required:false })
  organizationId: string;
}