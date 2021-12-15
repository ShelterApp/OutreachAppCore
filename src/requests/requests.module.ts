import { forwardRef, Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Request, RequestSchema } from './schema/request.schema';
import { RequestUser, RequestUserSchema } from './schema/request-user.schema';
import { RequestCamp, RequestCampSchema } from './schema/request-camp.schema';
import { CampsModule } from '../camps/camps.module';
import { AuditlogsModule } from '../auditlogs/auditlogs.module';
import { SuppliesModule } from '../supplies/supplies.module';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      ...configService.get('jwt')
    }),
    inject: [ConfigService],
  }), MongooseModule.forFeature([
    { name: Request.name, schema: RequestSchema },
    { name: RequestUser.name, schema: RequestUserSchema },
    { name: RequestCamp.name, schema: RequestCampSchema },
  ]), CampsModule, forwardRef(() => AuditlogsModule), SuppliesModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService]
})
export class RequestsModule { }
