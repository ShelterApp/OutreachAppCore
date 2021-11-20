import { Module } from '@nestjs/common';
import { CampsService } from './camps.service';
import { CampsController } from './camps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Camp, CampSchema } from './schema/camp.schema';
import { CampLog, CampLogSchema } from './schema/camp-log.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Camp.name, schema: CampSchema },
    { name: CampLog.name, schema: CampLogSchema},
  ])],
  controllers: [CampsController],
  providers: [CampsService]
})
export class CampsModule {}
