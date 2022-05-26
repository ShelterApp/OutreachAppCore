import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Request,
  NotFoundException,
  Put,
  Res,
  Req,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';

@ApiTags('Profile')
@Controller('profile')
@UseInterceptors(
  new SanitizeMongooseModelInterceptor({
    excludeMongooseId: false,
    excludeMongooseV: true,
  }),
)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnprocessableEntityResponse({
  status: 422,
  description: 'cannot process entity',
})
export class ProfileController {
  constructor(private readonly profileService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get profile of user' })
  @ApiOkResponse({ status: 200, description: 'User object' })
  @ApiNotFoundResponse({ status: 404, description: 'cannot found user' })
  async findOne(@Request() req) {
    const profile = await this.profileService.findById(req.user.id);
    if (!profile) {
      throw new NotFoundException('cannot found user');
    }
    return profile;
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile' })
  @ApiOkResponse({ status: 200, description: 'User object' })
  async update(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const id = req.user.id;
    return await this.profileService.updateProfile(id, updateProfileDto);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiNotFoundResponse({ status: 404, description: 'cannot found user' })
  @ApiUnprocessableEntityResponse({
    status: 422,
    description: 'unprocess entity',
  })
  @ApiBadRequestResponse({ status: 400, description: 'wrong password' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const id = req.user.id;

    await this.profileService.changePassword(id, changePasswordDto);

    res.status(204);
  }
}
