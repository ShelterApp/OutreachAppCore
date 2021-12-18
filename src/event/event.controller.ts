import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogAction, AuditLogType, UserRole } from '../enum';
import { Roles } from '../auth/roles.decorator';
import { SortParams } from '../utils/sort-params.dto';
import { PaginationParams } from '../utils/pagination-params';
import { SearchParams } from './dto/search-params.dto';
import ParamsWithId from 'src/utils/params-with-id';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import BodyWithUserId from 'src/utils/params-with-user-id';
import { AuditlogsService } from 'src/auditlogs/auditlogs.service';

@Controller('event')
@ApiTags('Events')
@ApiBearerAuth()
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private userService: UsersService,
    @Inject(forwardRef(() => AuditlogsService))
    private auditlogsService: AuditlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiOperation({ summary: 'Create events  (Admin, OrgLead)' })
  @ApiOkResponse({status: 200, description: 'Event object  (Admin, OrgLead)'})
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    try {
      createEventDto.createdBy = req.user.id
      const event = await this.eventService.create(createEventDto);
      return event;
    } catch(e) {
      throw e;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event' })
  @ApiOkResponse({status: 200, description: 'List events'})
  async find(@Query() { skip, limit }: PaginationParams, @Query() searchParams: SearchParams, @Query() sortParams: SortParams): Promise<{ items: any; total: any; }> {
    const [items, total] = await this.eventService.findAll(searchParams, sortParams, skip, limit);
    return {
      items,
      total
    };
  }

  @Post(':id/join')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join Event' })
  @ApiOkResponse({status: 204, description: 'Join Event'})
  async joinEvent(@Param() { id }: ParamsWithId, @Request() req, @Res() res: Response): Promise<any> {
    const joined = await this.eventService.joinEvent(id, req.user);
    //AuditLog
    this.auditlogsService.create(id, req.user.organizationId, req.user.id, [], AuditLogAction.JoinEvent, AuditLogType.Event);
    return res.status(204).send({});
  }

  @Post(':id/unjoin')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'UnJoin Event' })
  @ApiOkResponse({status: 204, description: 'Un Join Event'})
  async unJoinEvent(@Param() { id }: ParamsWithId, @Request() req, @Res() res: Response): Promise<any> {
    const unjoined = await this.eventService.unJoinEvent(id, req.user);
    return res.status(204).send({});
  }


  @Get(':id')
  @ApiParam({
    name: 'id'
  })
  @ApiOperation({ summary: 'Get event by id' })
  @ApiOkResponse({status: 200, description: 'event object'})
  async findOne(@Param() { id }: ParamsWithId): Promise<any> {
    return await this.eventService.findOne(id);
  }


  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event  (Admin, OrgLead)' })
  @ApiOkResponse({status: 200, description: 'Event object'})
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    try {
      updateEventDto.updatedBy = req.user.id
      updateEventDto.updatedAt = new Date();
      return await this.eventService.update(id, updateEventDto);
    } catch(e) {
      throw e;
    }
  }


  @Post(':id/add-paticipant')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add paticipant from event (Admin, OrgLead)' })
  @ApiOkResponse({status: 204, description: 'Add paticipant from event (Admin, OrgLead)'})
  async addPaticipal(@Param() { id }: ParamsWithId, @Body() {userId} : BodyWithUserId, @Request() req, @Res() res: Response): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('error_user_not_found');
    }
    const joined = await this.eventService.joinEvent(id, user);
    this.auditlogsService.create(id, user.organizationId, user.id, [], AuditLogAction.JoinEvent, AuditLogType.Event);
    return res.status(204).send({});
  }

  @Post(':id/remove-paticipant')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Roles(UserRole.OrgLead)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove paticipant from event (Admin, OrgLead)' })
  @ApiOkResponse({status: 204, description: 'Remove paticipant from event (Admin, OrgLead)'})
  async removePaticipant(@Param() { id }: ParamsWithId, @Body() {userId} : BodyWithUserId, @Request() req, @Res() res: Response): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('error_user_not_found');
    }
    const unjoined = await this.eventService.unJoinEvent(id, user);
    return res.status(204).send({});
  }

  @Delete(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  @ApiOkResponse({status: 204, description: 'No content'})
  async remove(@Param() { id }: ParamsWithId, @Res() res: Response) {
    await this.eventService.remove(id);

    res.status(204).send();
  }
}
