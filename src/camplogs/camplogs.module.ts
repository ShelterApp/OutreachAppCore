import { Module } from '@nestjs/common';
import { CamplogsService } from './camplogs.service';
import { CamplogsController } from './camplogs.controller';
import { CampLog, CampLogSchema } from './schema/camp-log.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([
    { name: CampLog.name, schema: CampLogSchema }
  ])],
  controllers: [CamplogsController],
  providers: [CamplogsService],
  exports: [CamplogsService]
})
export class CamplogsModule {}
