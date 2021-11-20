import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Request, RequestSchema } from './schema/request.schema';
import { RequestUser, RequestUserSchema } from './schema/request-user.schema';
import { RequestCamp, RequestCampSchema } from './schema/request-camp.schema';
import { CampsService } from 'src/camps/camps.service';
import { Camp, CampSchema } from 'src/camps/schema/camp.schema';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      ...configService.get('jwt')
    }),
    inject: [ConfigService],
  }), MongooseModule.forFeature([
    { name: Request.name, schema: RequestSchema },
    { name: Camp.name, schema: CampSchema },
    { name: RequestUser.name, schema: RequestUserSchema },
    { name: RequestCamp.name, schema: RequestCampSchema },
  ])],
  controllers: [RequestsController],
  providers: [RequestsService, CampsService]
})
export class RequestsModule { }
