import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable Only one domain in production
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const config = new DocumentBuilder()
    .setTitle('Outreach App')
    .setDescription('The Outreach App API description')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    .build();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, config);

  // fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));

  SwaggerModule.setup('', app, document);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
