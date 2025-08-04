import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OldUserModule } from './old_user/old_user.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import * as FinanceModules from './finance'; // Importing all finance modules

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Auth database connection (for users)
    MongooseModule.forRootAsync({
      connectionName: 'auth-db',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('AUTH_DATABASE_URL') ||
          'mongodb://localhost:27017/mysh-auth',
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
    // Service database connection (for transactions/finance)
    MongooseModule.forRootAsync({
      connectionName: 'service-db',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('SERVICE_DATABASE_URL') ||
          'mongodb://localhost:27017/mysh-service',
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
    // Service database connection (for transactions/finance)
    MongooseModule.forRootAsync({
      connectionName: 'dev-db',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('DEV_DATABASE_URL') ||
          'mongodb://localhost:27017/mysh-dev',
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
    // Importing modules
    OldUserModule,
    UserModule,
    HealthModule,
    DashboardModule,
    ...Object.values(FinanceModules), // Importing all finance modules dynamically
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
