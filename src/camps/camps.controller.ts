import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Query, Request, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../enum';
import { PaginationParams } from '../utils/pagination-params';
import ParamsWithId from '../utils/params-with-id';
import { SortParams } from '../utils/sort-params.dto';
import { CampsService } from './camps.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { SearchParams } from './dto/search-params.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import {Response} from 'express';
import { RequestsService } from '../requests/requests.service';
import { CreateCampRequestDto } from '../requests/dto/create-camp-request.dto';
@Controller('camps')
@ApiTags('Camps')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class CampsController {
  constructor(
    private readonly campsService: CampsService,
    private readonly requestsService: RequestsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create camps' })
  @ApiOkResponse({status: 200, description: 'List camps'})
  async create(@Body() createCampDto: CreateCampDto, @Request() req) {
    createCampDto.creator = req.user.id
    
    const camp =  await this.campsService.create(createCampDto);
    if (createCampDto.requestSupplies.length > 0) {
      //Create camp service
      const createCampRequest = new CreateCampRequestDto();
      createCampRequest.supplies = createCampRequest.supplies;
      await this.requestsService.createCampRequest(createCampRequest, camp, createCampDto.creator);
    }
    return camp;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get camp' })
  @ApiOkResponse({status: 200, description: 'List users'})
  async find(@Query() { skip, limit }: PaginationParams, @Query() searchParams: SearchParams, @Query() sortParams: SortParams): Promise<{ items: any; total: any; }> {
    const [items, total] = await this.campsService.findAll(searchParams, sortParams, skip, limit);
    return {
      items,
      total
    };
  }

  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @ApiOperation({ summary: 'Get camps by id' })
  @ApiOkResponse({status: 200, description: 'camps object'})
  async findOne(@Param() { id }: ParamsWithId): Promise<any> {
    return await this.campsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOperation({ summary: 'Update camp information' })
  @ApiOkResponse({status: 200, description: 'camp object'})
  async patch(@Param() { id }: ParamsWithId, @Body() updateCampDto: UpdateCampDto): Promise<any> {
    const camps = await this.campsService.update(id, updateCampDto);
    return camps;
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete camp' })
  @ApiOkResponse({status: 204, description: 'No content'})
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response) {
    await this.campsService.remove(id);

    res.status(204).send();
  }
}
