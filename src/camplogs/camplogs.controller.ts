import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CamplogsService } from './camplogs.service';

@Controller('camplogs')
export class CamplogsController {
  constructor(private readonly camplogsService: CamplogsService) {}

  @Get()
  findAll() {
    return this.camplogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.camplogsService.findOne(+id);
  }
}
