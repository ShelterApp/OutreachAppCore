import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/enum';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { PaginationParams } from '../utils/pagination-params';
import ParamsWithId from '../utils/params-with-id';
import { Response } from 'express';
import { SuppliesItemService } from './supplies-item.service';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { SearchParamsItem } from './dto/search-param-item.dto';
import { CreateSupplyItemsDto } from './dto/create-supply-items.dto';

@Controller('supplies-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Roles(UserRole.OrgLead)
@ApiTags('Supplies item of org (Role: Admin, OrgLead)')
@ApiBearerAuth()
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class SuppliesItemController {
  constructor(private readonly suppliesItemService: SuppliesItemService) {}

  @Post('/create-many')
  @ApiOperation({ summary: 'Create or Update Many Supplies Item' })
  @ApiOkResponse({status: 201, description: 'Supplies Item Object'})
  async createMany(@Body() createSupplyItemsDto: CreateSupplyItemsDto) {
    return await this.suppliesItemService.createMany(createSupplyItemsDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create or Update Supplies Item' })
  @ApiOkResponse({status: 201, description: 'Supplies Item Object'})
  async create(@Body() createSupplyItemDto: CreateSupplyItemDto) {
    return await this.suppliesItemService.create(createSupplyItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list supplies ' })
  @ApiOkResponse({status: 200, description: 'Supplies list'})
  async find(@Query() { skip, limit }: PaginationParams, @Query() searchParams: SearchParamsItem) {
    const [items, total] = await this.suppliesItemService.findAll(searchParams, skip, limit);
    return {
      items,
      total
    };
  }

  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @ApiOperation({ summary: 'Get supplies item by id' })
  @ApiOkResponse({status: 200, description: 'supplies item object'})
  async findOne(@Param() { id }: ParamsWithId) {
    return await this.suppliesItemService.findOne(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete supplies item' })
  @ApiOkResponse({status: 204, description: 'No content'})
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response) {
    await this.suppliesItemService.remove(id);

    res.status(204).send();
  }
}
