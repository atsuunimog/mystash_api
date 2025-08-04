import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection('auth-db') private readonly authConnection: Connection,
    @InjectConnection('service-db')
    private readonly serviceConnection: Connection,
  ) {}

  index(): string {
    return 'MyStash Admin API v1 - MongoDB with Mongoose';
  }

  async getHealth() {
    try {
      // Test both MongoDB connections
      const authConnected = this.authConnection.readyState === 1;
      const serviceConnected = this.serviceConnection.readyState === 1;

      return {
        status: 'ok',
        databases: {
          auth: {
            connected: authConnected,
            name: this.authConnection.name,
          },
          service: {
            connected: serviceConnected,
            name: this.serviceConnection.name,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        databases: {
          auth: 'error',
          service: 'error',
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
