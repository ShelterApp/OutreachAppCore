import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query, Res } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/enum';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { SearchParams } from './dto/search-param.dto';
import { PaginationParams } from '../utils/pagination-params';
import ParamsWithId from 'src/utils/params-with-id';
import { Response } from 'express';

@Controller('supplies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@ApiTags('Supplies')
@ApiBearerAuth()
@UseInterceptors(
  new SanitizeMongooseModelInterceptor({
    excludeMongooseId: false,
    excludeMongooseV: true,
  }),
)
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create Supplies (Role: Admin)' })
  @ApiOkResponse({ status: 201, description: 'Supplies Object' })
  async create(@Body() createSupplyDto: CreateSupplyDto) {
    return await this.suppliesService.create(createSupplyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list supplies' })
  @ApiOkResponse({ status: 200, description: 'Supplies list' })
  async find(
    @Query() { skip, limit }: PaginationParams,
    @Query() searchParams: SearchParams,
  ) {
    const [items, total] = await this.suppliesService.findAll(
      searchParams,
      skip,
      limit,
    );
    return {
      items,
      total,
    };
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
  })
  @ApiOperation({ summary: 'Get supplies by id (Role: Admin)' })
  @ApiOkResponse({ status: 200, description: 'supplies object' })
  async findOne(@Param() { id }: ParamsWithId) {
    return await this.suppliesService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update supplies (Role: Admin)' })
  @ApiOkResponse({ status: 200, description: 'supplies object' })
  async update(
    @Param() { id }: ParamsWithId,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ) {
    return this.suppliesService.update(id, updateSupplyDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete supplies (Role: Admin)' })
  @ApiOkResponse({ status: 204, description: 'No content' })
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response) {
    await this.suppliesService.remove(id);

    res.status(204).send();
  }
}
