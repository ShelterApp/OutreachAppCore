import * as path from 'path';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EnvConfig } from './configurations/environment.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from './organizations/organizations.module';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { RegionsModule } from './regions/regions.module';
import * as normalize from 'normalize-mongoose';
console.log(process.env.PWD)
@Module({
  imports: [
    EnvConfig,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongodb.uri'),
        connectionFactory: (connection) => {
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: configService.get('mailer.transport'),
        defaults: {
          from: configService.get('from'),
        },
        preview: false,
        template: {
          dir: path.join(__dirname, 'templates/pages'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
        options: {
          partials: {
            dir: path.join(__dirname, 'templates/partials'),
            options: {
              strict: false,
            },
          },
        },
      }),
      inject: [ConfigService],
    }),
    ProfileModule,
    RegionsModule,
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
