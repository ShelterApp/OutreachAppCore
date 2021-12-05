import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { User } from "../../users/schema/user.schema";
import { Camp } from "../../camps/schema/camp.schema";

export class Item{
    @IsString()
    name: string;

   @IsString()
    qty: number;
}

export class CreateCamplogDto {
    @IsMongoId()
    campId: string;

    @IsMongoId()
    userId: string;

    @IsString()
    campName: string;

    @IsString()
    fullname: string;

    @IsString()
    action: string;

    @IsArray()
    items: [Item];

    @IsString()
    message: string;
}
