import { Module } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { SuppliesController } from './supplies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Supply, SupplySchema } from './schema/supply.schema';
import { SupplyItem, SupplyItemSchema } from './schema/supply-item.schema';
import { SuppliesItemController } from './supplies-item.controller';
import { SuppliesItemService } from './supplies-item.service';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: Supply.name, schema: SupplySchema },
    { name: SupplyItem.name, schema: SupplyItemSchema },
  ])],
  controllers: [SuppliesController, SuppliesItemController],
  providers: [SuppliesService, SuppliesItemService],
  exports: [SuppliesService, SuppliesItemService]
})
export class SuppliesModule {}
