import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from 'src/organizations/schema/organization.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrganizationValidByIdRule } from '../validation/organization-validbyid-rule.validate';
import { MatchConstraint } from 'src/validation/match.validate';


@Module({
  imports: [MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema },{ name: User.name, schema: UserSchema }])],
  controllers: [ProfileController],
  providers: [UsersService, OrganizationsService, OrganizationValidByIdRule, MatchConstraint]
})
export class ProfileModule {}
