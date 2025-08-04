import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { DatabaseConfig } from '../interfaces';

export const getDatabaseConfig = (
  configService: ConfigService,
): DatabaseConfig => {
  const defaultOptions: Partial<MongooseModuleOptions> = {
    retryAttempts: 5,
    retryDelay: 2000,
  };

  const authDbUrl = configService.get<string>('AUTH_DATABASE_URL');
  const serviceDbUrl = configService.get<string>('SERVICE_DATABASE_URL');

  if (!authDbUrl) {
    throw new Error(
      'AUTH_DATABASE_URL is not defined in environment variables',
    );
  }

  if (!serviceDbUrl) {
    throw new Error(
      'SERVICE_DATABASE_URL is not defined in environment variables',
    );
  }

  return {
    authDb: {
      ...defaultOptions,
      uri: authDbUrl,
      connectionName: 'auth-db',
    },
    serviceDb: {
      ...defaultOptions,
      uri: serviceDbUrl,
      connectionName: 'service-db',
    },
  };
};

// Factory function for auth database configuration
export const authDbConfigFactory = (
  configService: ConfigService,
): MongooseModuleOptions => {
  return getDatabaseConfig(configService).authDb;
};

// Factory function for service database configuration
export const serviceDbConfigFactory = (
  configService: ConfigService,
): MongooseModuleOptions => {
  return getDatabaseConfig(configService).serviceDb;
};
