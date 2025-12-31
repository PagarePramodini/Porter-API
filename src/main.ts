import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // URL: /api

  // 👇 Enables validation based on class-validator decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // strips properties not in DTO
      forbidNonWhitelisted: false, // throws error if unknown properties are sent
      transform: true, // transforms plain JSON into class instances
    }),
  );
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();