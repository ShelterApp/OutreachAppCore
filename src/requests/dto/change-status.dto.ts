import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, RequestType } from 'src/enum';
 
export class ChangeStatusDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, example: 1, description: 'Filter by phone', required:false })
  status: RequestStatus;
}