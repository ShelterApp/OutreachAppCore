import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, UseGuards, Put, Request, BadRequestException, Res, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SearchParams } from './dto/search-params.dto';
import { PaginationParams } from '../utils/pagination-params';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangeStatusDto } from './dto/change-status.dto';
import ParamsWithId from '../utils/params-with-id';
import { Response } from 'express';
import { CreateCampRequestDto } from './dto/create-camp-request.dto';
import { CampsService } from '../camps/camps.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';
import { AuditLogAction, AuditLogType, RequestStatus, RequestType } from 'src/enum';
import { DropSupplyDto } from '../camps/dto/drop-supply.dto';
import { FullfillRequestDto } from './dto/fullfill-request.dto';
import { SuppliesItemService } from '../supplies/supplies-item.service';
import * as _ from 'lodash';
@Controller('requests')
@ApiTags('[Help Screen ] User Requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    @Inject(forwardRef(() => CampsService))
    private campsService: CampsService,
    @Inject(forwardRef(() => AuditlogsService))
    private auditlogsService: AuditlogsService,
    private suppliesItemService: SuppliesItemService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create User Help Request' })
  @ApiOkResponse({status: 200, description: 'Request Object'})
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Post('/camp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Camp Request' })
  @ApiOkResponse({status: 200, description: 'Request Object'})
  async createCampRequest(@Body() createCampRequestDto: CreateCampRequestDto, @Request() req) {
      const camp = await this.campsService.findOne(createCampRequestDto.campId);
      if (!camp) {
        throw new NotFoundException('error_camp_notfound');
      }
      const requestCamp = await this.requestsService.createCampRequest(createCampRequestDto, camp, req.user.id);

      // Build item
      this.auditlogsService.create(camp._id, req.user.organizationId, req.user.id, createCampRequestDto.supplies, AuditLogAction.RequestSupplies, AuditLogType.Camp);

      return requestCamp;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get request (include user request and camp request)' })
  @ApiOkResponse({status: 200, description: 'List request'})
  async find(@Query() { skip, limit }: PaginationParams, @Query() searchParams: SearchParams): Promise<{ items: any; total: any; }> {
    const [items, total] = await this.requestsService.findAll(searchParams, skip, limit);
    return {
      items,
      total
    };
  }

  @Get('my-claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'All request of mine' })
  @ApiOkResponse({status: 204, description: 'List request'})
  async myClaim(@Query() { skip, limit }: PaginationParams, @Request() req) {
    const userId = req.user.id;
    try {
      const [items, total] = await this.requestsService.getMyClaim(userId, skip, limit);
      return {
        items,
        total
      };
    } catch(error) {
      throw new BadRequestException('error when get my claim');
    }
  }

  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get request detail by id' })
  @ApiOkResponse({status: 200, description: 'request detail object'})
  async findOne(@Param() { id }: ParamsWithId): Promise<any> {
    return await this.requestsService.findOne(id);
  }

  @Put(':id/change-status')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change - status: enum(Open = 1,Claim = 3,Archive = 5,Delete = 7)' })
  @ApiOkResponse({status: 204, description: 'Change status success'})
  async changeStatus(@Param() { id }: ParamsWithId, @Body() changeStatusDto: ChangeStatusDto, @Request() req, @Res() res: Response) {
    const userId = req.user.id;
    try {
      await this.requestsService.changeStatus(id, changeStatusDto.status, userId);
      res.status(204).send({});
    } catch(error) {
      throw new BadRequestException('error when change status');
    }
  }

  @Put(':id/fullfill')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Full fill request of my claim (Create new request when supply not enough)' })
  @ApiOkResponse({status: 204, description: 'Change status success'})
  async fullfillRequest(
    @Param() { id }: ParamsWithId,
    @Body() fullfillRequestDto: FullfillRequestDto,
    @Request() req,
    @Res() res: Response) {
    const request = await this.requestsService.findOne(id);
    if (!request) {
      throw new NotFoundException('error_not_found_request');
    }
    if (request.status != RequestStatus.Claim) {
      throw new NotFoundException('error_request_must_claim_status');
    }
    if (request.type == RequestType.CampRequest) {
      const [changeStatus, camp] = await Promise.all([
        await this.requestsService.changeStatus(id, RequestStatus.Archive, req.user.id),
        await this.campsService.findOne(request.requestInfo.campId)
      ]);
      if (!camp) {
        throw new NotFoundException('error_not_found_camp');
      }
      const dropSupplyDto = new DropSupplyDto();
      dropSupplyDto.campId = camp._id;
      dropSupplyDto.supplies = fullfillRequestDto.supplies;
      dropSupplyDto.organizationId = req.user.organizationId;
      dropSupplyDto.createdBy = req.user.id;
      const drop = await this.campsService.dropSupply(dropSupplyDto);
      if (drop) {
        // update quantity supply of org
        await this.suppliesItemService.dropItem(drop);
        // Check quantity
        const dropSupplies = drop.supplies;
        const dropSuppliesByKey = _.keyBy(dropSupplies, 'supplyId');
        //Make new request
        let newSupplies = [];
        for(const i in request.requestInfo.supplies) {
          const requestItem = request.requestInfo.supplies[i];
          if (dropSuppliesByKey[requestItem.supplyId]) {
            if (dropSuppliesByKey[requestItem.supplyId].qty < requestItem.qty) {
              let newQty = requestItem.qty - dropSuppliesByKey[requestItem.supplyId].qty;
              const newRequestItem = _.clone(requestItem);
              newRequestItem.qty = newQty;
              newSupplies.push(newRequestItem);
            }
          } else {
            newSupplies.push(requestItem);
          }
        }
        if (newSupplies.length > 0) {
          const createCampRequestDto = new CreateCampRequestDto();
          createCampRequestDto.campId = camp._id;
          createCampRequestDto.supplies = newSupplies;
          this.requestsService.createCampRequest(createCampRequestDto, camp, request.user);
          this.auditlogsService.create(camp._id, req.user.organizationId, req.user.id, createCampRequestDto.supplies, AuditLogAction.RequestSupplies, AuditLogType.Camp);
        }
        this.auditlogsService.create(camp._id, req.user.organizationId, req.user.id, dropSupplyDto.supplies, AuditLogAction.DropSupplies, AuditLogType.Camp);
      }
      res.status(204).send();
    } else {
      await this.requestsService.changeStatus(id, RequestStatus.Archive, req.user.id);
    }
  }
  
}
