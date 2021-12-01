import { Module } from '@nestjs/common';
import { CampsService } from './camps.service';
import { CampsController } from './camps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Camp, CampSchema } from './schema/camp.schema';
import { CampLog, CampLogSchema } from './schema/camp-log.schema';
import { RequestsService } from '../requests/requests.service';
import { Request, RequestSchema } from '../requests/schema/request.schema';
import { RequestUser, RequestUserSchema } from '../requests/schema/request-user.schema';
import { RequestCamp, RequestCampSchema } from '../requests/schema/request-camp.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Camp.name, schema: CampSchema },
    { name: CampLog.name, schema: CampLogSchema},
    { name: Request.name, schema: RequestSchema },
    { name: RequestUser.name, schema: RequestUserSchema },
    { name: RequestCamp.name, schema: RequestCampSchema },
  ])],
  controllers: [CampsController],
  providers: [CampsService, RequestsService]
})
export class CampsModule {}
