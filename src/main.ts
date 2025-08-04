import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global interceptor for logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setGlobalPrefix('v1');

  //apply cors for all origins for development
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-api-key',
  });

  await app.listen(process.env.PORT ?? 8000);
  console.log(
    ` Application is running on: http://localhost:${process.env.PORT ?? 8000}`,
  );
}
bootstrap();
