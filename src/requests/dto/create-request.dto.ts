import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Category } from '../../categories/shema/category.schema';
import { LocationDto } from '../../utils/dto/location.dto';

export class CateDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: 'Parent Category Id',
    required: false,
  })
  parentCateId: Category;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: 'Parent Category Cate',
    required: false,
  })
  parentCateName: string;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '', description: 'Sub Category Id', required: false })
  subCateId: Category;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: 'Sub Category Name',
    required: false,
  })
  subCateName: string;

  @IsMongoId()
  @IsOptional()
  @ApiProperty({
    example: '',
    description: 'Size Category Id',
    required: false,
  })
  sizeCateId: Category;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '',
    description: 'Size Category Name',
    required: false,
  })
  sizeCateName: string;
}

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Deadpool',
    description: 'The name of user request',
    required: true,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'deadpool@gmail.com',
    description: 'The email of user request',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('US')
  @ApiProperty({
    example: '0111999222',
    description: 'The phone of user request',
    required: true,
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Any other details you would lie to add',
    description: 'Any other details you would lie to add',
    required: true,
  })
  note: string;

  @ValidateNested()
  @Type(() => CateDto)
  @ApiProperty({
    type: () => CateDto,
    description: 'Any other details you would lie to add',
    required: false,
  })
  cate: CateDto;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Newyork',
    description: 'Address of user',
    required: false,
  })
  address: string;

  @IsOptional()
  @ApiProperty({ description: 'GEO', required: false })
  location: LocationDto;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({ description: 'Created by', required: false })
  createdBy: string;
}
