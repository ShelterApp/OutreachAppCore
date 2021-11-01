import { Controller, Get, UseGuards, Request, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          properties: {
            results: {
              type: 'object',
              $ref: getSchemaPath(CreateUserDto),
            },
          },
        },
      ],
    },
  })
  async profile(@Request() req) {
    const user = await this.usersService.getProfile(req.user.id);
    return user;
  }
}
