import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Category } from "../../categories/shema/category.schema";

export class CateDto {
    @IsMongoId()
    @ApiProperty({ example: "", description: 'Parent Category Id', required: false })
    parentCateId: Category;
  
    @IsString()
    @ApiProperty({ example: "", description: 'Parent Category Cate', required: false })
    parentCateName: string;
  
    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "", description: 'Sub Category Id', required: false })
    subCateId: Category;
  
    @IsString()
    @IsOptional()
    @ApiProperty({ example: "", description: 'Sub Category Name', required: false })
    subCateName: string;
  
    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "", description: 'Size Category Id', required: false })
    sizeCateId: Category;
  
    @IsString()
    @IsOptional()
    @ApiProperty({ example: "", description: 'Size Category Name', required: false })
    sizeCateName: string;
}

export class CreateRequestDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Deadpool", description: 'The name of user request', required: true })
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: "deadpool@gmail.com", description: 'The email of user request', required: true })
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(12)
    @ApiProperty({ example: "0111999222", description: 'The phone of user request', required: true })
    phone: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Any other details you would lie to add", description: 'Any other details you would lie to add', required: true })
    note: string;

    @IsNotEmpty()
    @ApiProperty({ type: ()  => CateDto , description: 'Any other details you would lie to add', required: false })
    cate: CateDto;


    @IsNotEmpty()
    @ApiProperty({ example: 'Newyork' , description: 'Address of user', required: false })
    address: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 9.934739, description: 'Lat', required: false })
    lat: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: -84.087502, description: 'Long', required: false })
    lng: number;
}
