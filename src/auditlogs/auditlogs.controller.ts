import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Inject, forwardRef, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditLogType, UserRole } from '../enum';
import { PaginationParams } from '../utils/pagination-params';
import { AuditlogsService } from './auditlogs.service';
import { CampsService } from '../camps/camps.service';
import { EventService } from '../event/event.service';
import ParamsWithId from 'src/utils/params-with-id';

@Controller('auditlogs')
@ApiTags('AuditLogs')
export class AuditlogsController {
  constructor(
    private readonly auditlogsService: AuditlogsService,
    @Inject(forwardRef(() => CampsService))
    private campsService: CampsService,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService
  ) {}

  @Get('/camplogs/:id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get camps log' })
  @ApiOkResponse({status: 200, description: 'List camps logs'})
  async campLogs(@Param() { id }: ParamsWithId, @Query() { skip, limit }: PaginationParams) {
    const {items, total} =  await this.auditlogsService.campLogs(id, skip, limit);
    let results = [];
    for (const log of items) {
      const logDetail = await this.campsService.findOne(log.objectId.toString(), 'name description');
      results.push(this._setRequestDetail(log, logDetail))
    }
    return {
      results,
      total
    };
  }

  @Get('/mywork')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get my work' })
  @ApiOkResponse({status: 200, description: 'list my works'})
  async mywork(@Query() { skip, limit }: PaginationParams, @Request() req) {
    const {items, total} =  await this.auditlogsService.myWorks(req.user.id, skip, limit);
    let results = [];
    for (const log of items) {
      let logDetail = null;
      if (log.type == AuditLogType.Camp) {
        logDetail = await this.campsService.findOne(log.objectId.toString(), 'name description');
      } else {
        logDetail = await this.eventService.findById(log.objectId.toString(), 'title description startDate endDate');
      }
      results.push(this._setRequestDetail(log, logDetail))
    }
    return {
      results,
      total
    };
  }

  _setRequestDetail(log, logDetail) {
    const cloned = log.toObject({getters: true, versionKey: false});
    cloned._id = cloned.id
    delete cloned.id
    cloned['info'] =  logDetail;

    return cloned;
  }
}
