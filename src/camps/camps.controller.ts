import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Query, Request, Res, Inject, forwardRef, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogAction, AuditLogType, UserRole } from '../enum';
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
import { SuppliesItemService } from '../supplies/supplies-item.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';
import { ChangeStatusDto } from './dto/change-status.dto';
@Controller('camps')
@ApiTags('Camps')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
export class CampsController {
  constructor(
    private readonly campsService: CampsService,
    @Inject(forwardRef(() => RequestsService))
    private requestsService: RequestsService,
    private suppliesItemService: SuppliesItemService,
    @Inject(forwardRef(() => AuditlogsService))
    private auditlogsService: AuditlogsService
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
    if (createCampDto.dropSupplies && createCampDto.dropSupplies.length > 0) {
      const validator = await this.suppliesItemService.validateSupply(createCampDto.dropSupplies, orgId);
      if (!validator) {
        throw new BadRequestException('error_supply_item_not_enough');
      }
    }

    createCampDto.createdBy = req.user.id
    
    const camp = await this.campsService.create(createCampDto);
    if (createCampDto.requestSupplies && createCampDto.requestSupplies.length > 0) {
      //Create camp service
      const createCampRequest = new CreateCampRequestDto();
      createCampRequest.supplies = createCampDto.requestSupplies;
      await this.requestsService.createCampRequest(createCampRequest, camp, createCampDto.createdBy);
      this.auditlogsService.create(camp._id, orgId, req.user.id, createCampRequest.supplies, AuditLogAction.RequestSupplies, AuditLogType.Camp);
    }
    if (createCampDto.dropSupplies && createCampDto.dropSupplies.length > 0) {
      // Dont validate drop supplies
      const dropSupplyDto = new DropSupplyDto();
      dropSupplyDto.campId = camp._id;
      dropSupplyDto.supplies = createCampDto.dropSupplies;
      dropSupplyDto.organizationId = req.user.organizationId;
      dropSupplyDto.createdBy = req.user.id;
      const drop = await this.campsService.dropSupply(dropSupplyDto);
      if (drop) {
        // update quantity supply of org
        await this.suppliesItemService.dropItem(drop);
        this.auditlogsService.create(camp._id, orgId, req.user.id, dropSupplyDto.supplies, AuditLogAction.DropSupplies, AuditLogType.Camp);
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
      dropSupplyDto.createdBy = req.user.id;
      dropSupplyDto.organizationId = orgId;
      const drop = await this.campsService.dropSupply(dropSupplyDto);
      if (drop) {
        // update quantity supply of org
        await this.suppliesItemService.dropItem(drop);
        this.auditlogsService.create(id, orgId, req.user.id, dropSupplyDto.supplies, AuditLogAction.DropSupplies, AuditLogType.Camp);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get camps by id' })
  @ApiOkResponse({status: 200, description: 'camps object'})
  async findOne(@Param() { id }: ParamsWithId): Promise<any> {
    return await this.campsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update camp information' })
  @ApiOkResponse({status: 200, description: 'camp object'})
  async patch(@Param() { id }: ParamsWithId, @Body() updateCampDto: UpdateCampDto, @Request() req): Promise<any> {
    updateCampDto.updatedBy = req.user.id;
    updateCampDto.updatedAt = new Date();
    const camps = await this.campsService.update(id, updateCampDto);
    return camps;
  }


  @Put(':id/change-status')
  @ApiParam({
    name: 'id'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change Camp Status {Actived = 1,Inactive = 3,Lostinsweet = 5}' })
  @ApiOkResponse({status: 200, description: 'camp object {Actived = 1,Inactive = 3,Lostinsweet = 5}'})
  async changeStatus(@Param() { id }: ParamsWithId, @Body() changeStatus: ChangeStatusDto, @Request() req): Promise<any> {
    const updateCampDto = new UpdateCampDto();
    updateCampDto.status = changeStatus.status;
    updateCampDto.updatedBy = req.user.id;
    updateCampDto.updatedAt = new Date();
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
