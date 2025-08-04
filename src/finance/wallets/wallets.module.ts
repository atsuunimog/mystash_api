import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallets, WalletsSchema } from './wallets.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Wallets.name, schema: WalletsSchema }],
      'service-db',
    ),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
