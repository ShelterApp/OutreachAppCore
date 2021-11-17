import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, RequestType } from 'src/enum';
 
export class SearchParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search by keyword (name, description)', required:false })
  keyword: string;
 
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: [1,3], description: 'Filter by type (UserRequest: 1, CampRequest: 3)', required:false })
  type: RequestType;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: [1,3,5,7], description: 'Filter by status: enum(Open = 1,Claim = 3,Archive = 5,Delete = 7)', required:false })
  status: RequestStatus;
}