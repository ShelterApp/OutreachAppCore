import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { RegionValidRule } from 'src/validation/region-valid-rule.validate';
import { RegionUniqueByCodeRule } from 'src/validation/region-unique-by-code-rule.validate';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from './schema/region.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Region.name, schema: RegionSchema }
  ])],
  controllers: [RegionsController],
  providers: [RegionsService, RegionValidRule, RegionUniqueByCodeRule]
})
export class RegionsModule {}
