import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection('auth-db') private authConnection: Connection,
    @InjectConnection('service-db') private serviceConnection: Connection,
  ) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('detailed')
  getDetailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.version,
    };
  }

  @Get('database')
  getDatabaseHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      databases: {
        authDb: {
          state: this.authConnection.readyState,
          name: this.authConnection.name,
          host: this.authConnection.host,
          port: this.authConnection.port,
        },
        serviceDb: {
          state: this.serviceConnection.readyState,
          name: this.serviceConnection.name,
          host: this.serviceConnection.host,
          port: this.serviceConnection.port,
        },
      },
      connectionStates: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      },
    };
  }
}
