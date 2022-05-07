import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from 'src/organizations/schema/organization.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrganizationValidByIdRule } from '../validation/organization-validbyid-rule.validate';
import { MatchConstraint } from '../validation/match.validate';
import { RegionsService } from '../regions/regions.service';
import { RegionValidRule } from '../validation/region-valid-rule.validate';
import { Region, RegionSchema } from '../regions/schema/region.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendgridService } from '../sendgrid/sendgrid.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('jwt'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
      { name: Region.name, schema: RegionSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    UsersService,
    OrganizationsService,
    OrganizationValidByIdRule,
    MatchConstraint,
    RegionsService,
    RegionValidRule,
    SendgridService,
  ],
})
export class ProfileModule {}
