import { Body, ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse, getSchemaPath } from '@nestjs/swagger';
import { CreateUserDto } from '../auth/dto/create-user.dto';
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
      const createUserDto = new CreateUserDto();
      createUserDto.organization = org;
      createUserDto.email = org.email;
      createUserDto.name = org.name;
      createUserDto.phone = org.phone;
      createUserDto.userType = UserRole.OrgLead;
      createUserDto.password = Helpers.randomString(10);
      await this.usersService.create(createUserDto);
    }

    return org;
  }
}
