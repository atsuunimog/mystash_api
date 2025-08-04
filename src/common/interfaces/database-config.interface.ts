import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface DatabaseConfig {
  authDb: MongooseModuleOptions;
  serviceDb: MongooseModuleOptions;
}
