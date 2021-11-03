import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization, OrganizationSchema } from '../organizations/schema/organization.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema },{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, OrganizationsService],
  exports: [UsersService]
})
export class UsersModule {}
