import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendgridService } from './sendgrid.service';

@Module({
  imports: [ConfigModule.forRoot()],
  // controllers: [],
  providers: [SendgridService],
})
export class SendgridModule {}
