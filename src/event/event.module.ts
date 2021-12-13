import { forwardRef, Logger, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, Event } from './schema/event.schema';
import { EventAttendees, EventAttendeesSchema } from './schema/event-attendees.schema';
import { IsDateTimeConstraint } from '../validation/datetime.validate';
import { IsDateConstraint } from '../validation/date.validate';
import { IsBeforeDateConstraint } from '../validation/before-date.validate';
import { UsersModule } from '../users/users.module';
import { AuditlogsModule } from '../auditlogs/auditlogs.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Event.name,
        useFactory: () => {
          const schema = EventSchema;
          schema.pre('save', function() { 
            const event = this;
           });
          return schema;
        },
      },
    ]),
    MongooseModule.forFeature([
    { name: EventAttendees.name, schema: EventAttendeesSchema }
  ]), UsersModule, forwardRef(() => AuditlogsModule)],
  controllers: [EventController],
  providers: [EventService, IsDateTimeConstraint, IsDateConstraint, IsBeforeDateConstraint, Logger],
  exports: [EventService]
})
export class EventModule {}
