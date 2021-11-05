import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Query, Res } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import ParamsWithId from '../utils/params-with-id';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enum';
import { PaginationParams } from 'src/utils/pagination-params';
import { Response } from 'express';

@Controller('regions')
@ApiTags('Regions')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new region' })
  @ApiOkResponse({status: 200, description: 'Region object'})
  async create(@Body() createRegionDto: CreateRegionDto) {
    return await this.regionsService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list region' })
  @ApiOkResponse({status: 200, description: 'Region list'})
  async find(@Query() { skip, limit }: PaginationParams) {
    const [items, total] = await this.regionsService.findAll({}, skip, limit);
    return {
      items,
      total
    };
  }

  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @ApiOperation({ summary: 'Get region by id' })
  @ApiOkResponse({status: 200, description: 'Region object'})
  async findOne(@Param() { id }: ParamsWithId) {
    return await this.regionsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update region' })
  @ApiOkResponse({status: 200, description: 'Region object'})
  async update(@Param() { id }: ParamsWithId, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionsService.update(id, updateRegionDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete region' })
  @ApiOkResponse({status: 204, description: 'No content'})
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response) {
    await this.regionsService.remove(id);

    res.status(204).send();
  }
}
