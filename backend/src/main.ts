import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';
import { buildCorsOptions } from './shared/utils/cors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(RequestIdMiddleware);
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');
  app.enableCors(buildCorsOptions());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const swagger = new DocumentBuilder()
    .setTitle('FYPMS API')
    .setDescription('Final Year Project Management System - Enterprise REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`FYPMS API listening on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start FYPMS API:', error);
  process.exit(1);
});
