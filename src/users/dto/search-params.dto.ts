import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/enum';
 
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

  @IsOptional()
  @IsString()
  @ApiProperty({ enum:[1,3], default: null, description: 'Filter by status (1: Enabled, 3:Disabled)', required:false })
  status: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: UserRole, default: null, description: 'Filter by type', required:false })
  userType: string;
}