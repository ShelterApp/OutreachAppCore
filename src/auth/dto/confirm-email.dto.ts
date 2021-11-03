import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
 
export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "randomString", description: 'token confirm email', required: true })
  token: string;
}
 
export default ConfirmEmailDto;