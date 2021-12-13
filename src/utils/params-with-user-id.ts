import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
 
class BodyWithUserId {
  @IsMongoId()
  @ApiProperty({ example: '', description: 'User mongo id', required:true })
  userId: string;
}
 
export default BodyWithUserId;