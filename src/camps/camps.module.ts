import { forwardRef, Module } from '@nestjs/common';
import { CampsService } from './camps.service';
import { CampsController } from './camps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Camp, CampSchema } from './schema/camp.schema';
import { DropSupply, DropSupplySchema } from './schema/drop-supply.schema';
import { RequestsModule } from '../requests/requests.module';
import { SuppliesModule } from '../supplies/supplies.module';
import { AuditlogsModule } from 'src/auditlogs/auditlogs.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Camp.name, schema: CampSchema },
    { name: DropSupply.name, schema: DropSupplySchema }
  ]), forwardRef(() => RequestsModule), SuppliesModule, forwardRef(() => AuditlogsModule)],
  controllers: [CampsController],
  providers: [CampsService],
  exports: [CampsService]
})
export class CampsModule {}
