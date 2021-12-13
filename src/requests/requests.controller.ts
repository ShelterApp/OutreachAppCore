import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, UseGuards, Put, Request, BadRequestException, Res, forwardRef, Inject } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { SearchParams } from './dto/search-params.dto';
import { PaginationParams } from '../utils/pagination-params';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ChangeStatusDto } from './dto/change-status.dto';
import ParamsWithId from '../utils/params-with-id';
import { Response } from 'express';
import { CreateCampRequestDto } from './dto/create-camp-request.dto';
import { CampsService } from '../camps/camps.service';
import { AuditlogsService } from '../auditlogs/auditlogs.service';
import { AuditLogAction, AuditLogType } from 'src/enum';

@Controller('requests')
@ApiTags('[Help Screen ] User Requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    @Inject(forwardRef(() => CampsService))
    private campsService: CampsService,
    @Inject(forwardRef(() => AuditlogsService))
    private auditlogsService: AuditlogsService,
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
    try {
      const camp = await this.campsService.findOne(createCampRequestDto.campId);
      const requestCamp = await this.requestsService.createCampRequest(createCampRequestDto, camp, req.user.id);

      // Build item
      this.auditlogsService.create(camp._id, req.user.organizationId, req.user.id, createCampRequestDto.supplies, AuditLogAction.RequestSupplies, AuditLogType.Camp);

      return requestCamp;
    } catch(e) {
      console.log(e);
    }
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
  async fullfillRequest(@Param() { id }: ParamsWithId, @Request() req, @Res() res: Response) {
      return {
        'message': 'developing'
      }
  }
  

  @Put(':id/release')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release request of my claim (Write log)' })
  @ApiOkResponse({status: 204, description: 'Release reqeust success'})
  async releaseRequest(@Param() { id }: ParamsWithId, @Request() req, @Res() res: Response) {
      return {
        'message': 'developing'
      }
  }
}
