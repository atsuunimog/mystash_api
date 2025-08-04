import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rates, RatesSchema } from './rates.schema';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Rates.name, schema: RatesSchema }],
      'service-db',
    ),
  ],
  controllers: [RatesController],
  providers: [RatesService],
})
export class RatesModule {}
