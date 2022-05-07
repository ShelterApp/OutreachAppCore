import * as path from 'path';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EnvConfig } from './configurations/environment.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from './organizations/organizations.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { RegionsModule } from './regions/regions.module';
import { CategoriesModule } from './categories/categories.module';
import { RequestsModule } from './requests/requests.module';
import { SuppliesModule } from './supplies/supplies.module';
import { CampsModule } from './camps/camps.module';
import { EventModule } from './event/event.module';
import { AuditlogsModule } from './auditlogs/auditlogs.module';
import { PagesModule } from './pages/pages.module';
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
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get('mailer.user'),
            pass: configService.get('mailer.pass'),
          },
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
    CategoriesModule,
    RequestsModule,
    SuppliesModule,
    CampsModule,
    EventModule,
    AuditlogsModule,
    PagesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
