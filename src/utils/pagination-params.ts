import { IsNumber, Min, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
 
export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 0, description: 'Skip', required:false })
  @Transform(({value}) => Number.parseInt(value))
  skip: number;
 
  @IsOptional()
  @Type(() => Number)
  @Transform(({value}) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10, description: 'Limit', required:false })
  limit: number;
}