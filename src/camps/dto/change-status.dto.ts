import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber} from 'class-validator';
import { User } from 'src/users/schema/user.schema';

export class ChangeStatusDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, enum: [1,3,5] , description: 'CampStatus{Actived = 1,Inactive = 3,Lostinsweet = 5} Default is active', default: 1, required: false })
    status: number;

    updatedBy: User;

    updatedAt: Date;
}
