import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, Res, UnprocessableEntityException, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnprocessableEntityResponse, getSchemaPath } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { PaginationParams } from 'src/utils/pagination-params';
import ParamsWithId from 'src/utils/params-with-id';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../enum';
import { UsersService } from '../users/users.service';
import Helpers from '../utils/helper';
import { CreateOriganizationDto } from './dto/create-organization.dto';
import { UpdateOriganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
import { Organization } from './schema/organization.schema';
import { CreateOrganizationSchema } from './swagger-schema';
import { Response } from 'express';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@ApiTags('Organizations')
@Controller('organizations')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService : UsersService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create organization' })
  @ApiCreatedResponse(CreateOrganizationSchema.ApiCreatedResponse)
  @ApiBadRequestResponse(CreateOrganizationSchema.ApiBadRequestResponse)
  @ApiUnprocessableEntityResponse(CreateOrganizationSchema.ApiUnprocessableEntityResponse)
  async create(@Body() createOriganizationDto: CreateOriganizationDto): Promise<Organization> {
    const org = await this.organizationsService.create(createOriganizationDto);
    if (org) {
      // Create user lead from org
      const createUserDto = new RegisterUserDto();
      createUserDto.organizationId = org;
      createUserDto.email = org.email;
      createUserDto.name = org.name;
      createUserDto.phone = org.phone;
      createUserDto.password = createOriganizationDto.password;
      createUserDto.userType = UserRole.OrgLead;
      const user = await this.usersService.register(createUserDto);
      await this.organizationsService.sendEmailVerification(user.email);
    }

    return org;
  }

  @Get()
  @ApiOperation({ summary: 'Get list organization' })
  @ApiOkResponse({status: 200, description: 'organization list'})
  async find(@Query() { skip, limit }: PaginationParams) {
    const [items, total] = await this.organizationsService.findAll({}, skip, limit);
    return {
      items,
      total
    };
  }


  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @ApiOperation({ summary: 'Get organization by id' })
  @ApiOkResponse({status: 200, description: 'Organization object'})
  async findOne(@Param() { id }: ParamsWithId): Promise<any> {
    return await this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOperation({ summary: 'Update org information' })
  @ApiOkResponse({status: 200, description: 'Org object'})
  async patch(@Param() { id }: ParamsWithId, @Body() updateOrgDto: UpdateOriganizationDto): Promise<any> {
    const org = await this.organizationsService.update(id, updateOrgDto);
    if (org) {
      //Update user lead of org
      const user = await this.usersService.findByEmail(org.email);
      const updateUserDto = new UpdateUserDto();
      updateUserDto.name = org.name;
      updateUserDto.phone = org.phone;
      this.usersService.update(user._id, updateUserDto);
    }
    return org;
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiOkResponse({status: 204, description: 'Delete user successfull'})
  async delete(@Param() { id }: ParamsWithId, @Res() res: Response): Promise<any> {
    try {
      const currentOrg = await this.organizationsService.findById(id);
      const org = await this.organizationsService.remove(id);
      if (org) {
        //Update user lead of org
        const user = await this.usersService.findByEmail(currentOrg.email);
        this.usersService.remove(user._id);
      }
    } catch(error) {
      throw new UnprocessableEntityException('error when remove org');
    }
    res.status(204).send();
  }

}
