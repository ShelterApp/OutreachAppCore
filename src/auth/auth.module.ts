/*
https://docs.nestjs.com/modules
*/

import { MailerService } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { OrganizationValidRule } from '../validation/organization-valid-rule.validate';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization, OrganizationSchema } from '../organizations/schema/organization.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UserExistsRule } from '../validation/user-exists-rule.validate';
@Module({
    controllers: [AuthController],
    imports: [PassportModule, JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            ...configService.get('jwt')
        }),
        inject: [ConfigService],
    }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema}, {name: Organization.name, schema: OrganizationSchema}])],
    providers: [AuthService, UsersService, OrganizationsService, OrganizationValidRule, UserExistsRule, LocalStrategy, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule { }
