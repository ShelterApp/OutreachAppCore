import { IsNumber, Min, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
 
export class SearchParamsItem {
    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "617ff83996b51c393f5162f3", description: 'The id of orgnazation', required: false })
    organizationId: string

    @IsMongoId()
    @IsOptional()
    @ApiProperty({ example: "", description: 'The id of supplies', required: false })
    supplyId: string

}