import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/enum';
import { PaginationParams } from 'src/utils/pagination-params';

@Controller('pages')
@ApiTags('Pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new page' })
  @ApiOkResponse({status: 200, description: 'Create new page'})
  async create(@Body() createPageDto: CreatePageDto) {
    try {
      return await this.pagesService.create(createPageDto);
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list page' })
  @ApiOkResponse({status: 200, description: 'page list'})
  async find(@Query() { skip, limit }: PaginationParams) {
    const [items, total] = await this.pagesService.findAll(skip, limit);
    return {
      items,
      total
    };
  }

  @Get(':indentifier')
  @ApiParam({
    name: 'indentifier'
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get page by identifier' })
  @ApiOkResponse({status: 200, description: 'page object'})
  async findOne(@Param('indentifier') id: string) {
    return await this.pagesService.findOneByIdentifier(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update page' })
  @ApiOkResponse({status: 200, description: 'Page object'})
  async update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    try {
      return await this.pagesService.update(id, updatePageDto);
    } catch(error) {
      throw new BadRequestException(error.message);
    }
  }
}
