import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
 
export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "abc@outreach.com", description: 'Email forgot password', required: true })
  email: string;
}
 
export default ForgotPasswordDto;