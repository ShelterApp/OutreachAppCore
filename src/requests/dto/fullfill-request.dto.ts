import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Organization } from "../../organizations/schema/organization.schema";
import { Supply } from "../../supplies/schema/supply.schema";
import { User } from "../../users/schema/user.schema";
import { CreateSupplyListDto } from "./create-camp-request.dto";


export class FullfillRequestDto {
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateSupplyListDto)
    @ApiProperty({ type: ()  => [CreateSupplyListDto] , description: 'supplies request', required: true })
    supplies: CreateSupplyListDto[]
}

