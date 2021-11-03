import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const config = new DocumentBuilder()
    .setTitle('OutReach App')
    .setDescription('The OutReach App API description')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    .build();
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);
  
  await app.listen(3000);
}
bootstrap();
