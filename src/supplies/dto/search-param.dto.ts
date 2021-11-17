import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SupplyStatus } from 'src/enum';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword', required:false })
  keyword: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ enum:[1,3], default: null, description: 'Filter by status (1: Enabled, 3:Disabled)', required:false })
  status: number;

}