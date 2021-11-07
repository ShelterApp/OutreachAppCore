import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { OrganizationsService } from './organizations.service';
import { Organization } from './schema/organization.schema';
import { CreateOrganizationSchema } from './swagger-schema';

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
      createUserDto.userType = UserRole.OrgLead;
      createUserDto.password = Helpers.randomString(10);
      await this.usersService.register(createUserDto);
    }

    return org;
  }

  @Get()
  @ApiOperation({ summary: 'Get list organization' })
  @ApiOkResponse({status: 200, description: 'Region list'})
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

}
