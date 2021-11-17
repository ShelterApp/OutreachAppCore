import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateSupplyDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Hot meals", description: 'The name suplie item', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "Hot meal means a measure of food served and eaten at one sitting prepared in accordance with OAC 310:256 and served at a palatable temperature range of 110º - 120º F. (43.3º – 48.8º C.).", description: 'The desc suplie item' })
    description: string;

    @IsNumber()
    @ApiProperty({ type: 'enum', example: 1, description: 'Status of supplies (1: Enabled, 3: Disabled)' })
    status: number
}
