import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Supply } from "src/supplies/schema/supply.schema";
import { User } from "src/users/schema/user.schema";
import { CreateSupplyListDto } from "./create-camp.dto";


export class DropSupplyList {

    @ValidateNested()
    @IsOptional()
    @Type(() => CreateSupplyListDto)
    @ApiProperty({ type: ()  => [CreateSupplyListDto] , description: 'supplies request', required: true })
    supplies: CreateSupplyListDto[]
}

