import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS enable
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Learning Management System - Complete CRUD API')
    .setVersion('1.0')
    .addTag('Courses', 'Course management endpoints')
    .addTag('Students', 'Student management endpoints')
    .addTag('Instructors', 'Instructor management endpoints')
    .addTag('Enrollments', 'Enrollment management endpoints')
    .addTag('Sections', 'Section management endpoints')
    .addTag('Lessons', 'Lesson management endpoints')
    .addTag('Resources', 'Resource management endpoints')
    .addTag('Lesson Progress', 'Lesson progress tracking endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 LMS Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger Docs:          http://localhost:${port}/api/docs`);
  console.log(`📁 Uploads folder:        http://localhost:${port}/uploads/`);
}

bootstrap();
