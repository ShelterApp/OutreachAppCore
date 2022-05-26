import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  Organization,
  OrganizationSchema,
} from '../organizations/schema/organization.schema';
import { OrganizationValidByIdRule } from '../validation/organization-validbyid-rule.validate';
import { RegionsService } from '../regions/regions.service';
import { RegionValidRule } from '../validation/region-valid-rule.validate';
import { Region, RegionSchema } from '../regions/schema/region.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
  controllers: [UsersController],
  providers: [
    UsersService,
    OrganizationsService,
    OrganizationValidByIdRule,
    RegionsService,
    RegionValidRule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
