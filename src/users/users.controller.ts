import { Controller, Get, UseGuards, Request, UseInterceptors, Query, Put, Patch, Body, Param, UsePipes, ValidationPipe, Post, Delete, UnprocessableEntityException, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { UpdateUserDto } from './dto/update-user.dto';
import ParamsWithId from '../utils/params-with-id';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enum';
import { PaginationParams } from '../utils/pagination-params';
import { OrganizationsService } from '../organizations/organizations.service';
import { Response } from 'express';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Users')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService
  ) {}

  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 200, description: 'User object'})
  async findOne(@Param() { id }: ParamsWithId,) {
    const user = await this.usersService.findById(id);
    return user;
  }

  @Get()
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 200, description: 'List users'})
  async find(@Query() { skip, limit }: PaginationParams) {
    console.log(typeof limit);
    const [items, total] = await this.usersService.findAll({}, skip, limit);
    return {
      items,
      total
    };
  }

  @Post()
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 200, description: 'Create user'})
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    const org = await this.organizationsService.findByCode(createUserDto.orgCode);
    createUserDto.organization = org;
    delete createUserDto.orgCode;
    const user = await this.usersService.create(createUserDto);

    return user;
  }

  @Put(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 200, description: 'User object'})
  async update(@Param() { id }: ParamsWithId, @Body() updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.usersService.update(id, updateUserDto);

    return user;
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 200, description: 'User object'})
  async patch(@Param() { id }: ParamsWithId, @Body() updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.usersService.update(id, updateUserDto);

    return user;
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOkResponse({status: 204, description: 'Delete user successfull'})
  async delete(@Param() { id }: ParamsWithId, @Request() req , @Res() res: Response): Promise<any> {
    console.log(req.user.id);
    try {
      
      const user = await this.usersService.remove(id);
    } catch(error) {
      console.log(error);
      throw new UnprocessableEntityException();
    }
    res.status(204).send();
  }

  @Get('/test/sendemail')
  @ApiQuery({
    name: 'email'
  })
  @ApiOkResponse({status: 204, description: 'Send mail success'})
  async email(@Query('email') email, @Res() res: Response ) {
    const mail = await this.usersService.testMail(email);
    console.log(mail);
    res.status(204).send({});
  }
}
