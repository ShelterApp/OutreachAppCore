import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Query, Request, Res, Inject, forwardRef, BadRequestException } from '@nestjs/common';
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
import { CreateCampDto, CreateSupplyListDto } from './dto/create-camp.dto';
import { SearchParams } from './dto/search-params.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import {Response} from 'express';
import { RequestsService } from '../requests/requests.service';
import { CreateCampRequestDto } from '../requests/dto/create-camp-request.dto';
import { DropSupplyDto } from './dto/drop-supply.dto';
import { DropSupplyList } from './dto/drop-supply-list.dto';
import { SuppliesItemService } from 'src/supplies/supplies-item.service';
import { CamplogsService } from 'src/camplogs/camplogs.service';
import { CreateCamplogDto } from 'src/camplogs/dto/create-camplog.dto';
@Controller('camps')
@ApiTags('Camps')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class CampsController {
  constructor(
    private readonly campsService: CampsService,
    @Inject(forwardRef(() => RequestsService))
    private requestsService: RequestsService,
    private suppliesItemService: SuppliesItemService,
    private campLogService: CamplogsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create camps' })
  @ApiOkResponse({status: 200, description: 'List camps'})
  async create(@Body() createCampDto: CreateCampDto, @Request() req) {
    const orgId = req.user.organizationId;
    const validator = await this.suppliesItemService.validateSupply(createCampDto.dropSupplies, orgId);
    if (!validator) {
      throw new BadRequestException('error_supply_item_not_enough');
    }

    createCampDto.creator = req.user.id
    
    const camp = await this.campsService.create(createCampDto);
    if (createCampDto.requestSupplies.length > 0) {
      //Create camp service
      const createCampRequest = new CreateCampRequestDto();
      createCampRequest.supplies = createCampDto.requestSupplies;
      await this.requestsService.createCampRequest(createCampRequest, camp, createCampDto.creator);
    }
    if (createCampDto.dropSupplies.length > 0) {
      // Dont validate drop supplies
      const dropSupplyDto = new DropSupplyDto();
      dropSupplyDto.campId = camp._id;
      dropSupplyDto.supplies = createCampDto.dropSupplies;
      dropSupplyDto.organizationId = req.user.organizationId;
      dropSupplyDto.creator = req.user.id;
      const drop = await this.campsService.dropSupply(dropSupplyDto);
      if (drop) {
        // update quantity supply of org
        await this.suppliesItemService.dropItem(drop);
      }
    }
    return camp;
  }


  @Post(':id/drop-supply')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Drop Supplies' })
  @ApiOkResponse({status: 200, description: 'Drop Supplies'})
  async dropSupply(@Body() dropSupplyList: DropSupplyList,@Param() { id }: ParamsWithId, @Request() req) {
    const orgId = req.user.organizationId;
    const validator = await this.suppliesItemService.validateSupply(dropSupplyList.supplies, orgId);
    if (validator) {
      const dropSupplyDto = new DropSupplyDto();
      dropSupplyDto.campId = id;
      dropSupplyDto.supplies = dropSupplyList.supplies;
      dropSupplyDto.creator = req.user.id;
      dropSupplyDto.organizationId = orgId;
      const drop = await this.campsService.dropSupply(dropSupplyDto);
      if (drop) {
        // update quantity supply of org
        await this.suppliesItemService.dropItem(drop);
      }
      return drop;
    } else {
      throw new BadRequestException('error_supply_item_not_enough');
    }
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
