import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParamsItem {
    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "", description: 'The id of orgnazation', required: false })
    organizationId: string

    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "", description: 'The id of supplies', required: false })
    supplyId: string

}