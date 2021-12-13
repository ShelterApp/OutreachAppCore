import { forwardRef, Module } from '@nestjs/common';
import { AuditlogsService } from './auditlogs.service';
import { AuditlogsController } from './auditlogs.controller';
import { Auditlog, AuditlogSchema } from './schema/auditlog.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CampsModule } from 'src/camps/camps.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Auditlog.name, schema: AuditlogSchema },
  ]), forwardRef(() => CampsModule), forwardRef(() => EventModule)],
  controllers: [AuditlogsController],
  providers: [AuditlogsService],
  exports: [AuditlogsService]
})
export class AuditlogsModule {}
