import { IsNumber, Min, IsOptional, IsString, IsMongoId, isNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, description)', required:false })
  keyword: string;

}