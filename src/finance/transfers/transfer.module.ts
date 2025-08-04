import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { Transfers, TransfersSchema } from './transfer.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Transfers.name, schema: TransfersSchema }],
      'service-db',
    ),
  ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
