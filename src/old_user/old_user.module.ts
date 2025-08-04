import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OldUserController } from './old_user.controller';
import { OldUserService } from './old_user.service';
import { OldUser, OldUserSchema } from './old_user.schema';
import {
  OldUserStatistics,
  OldUserStatisticsSchema,
} from './old_user-statistics.schema';
import {
  Transactions,
  TransactionsSchema,
} from '../finance/transactions/transactions.schema';
import { Payments, PaymentsSchema } from '../finance/payments/payments.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: OldUser.name, schema: OldUserSchema },
        { name: OldUserStatistics.name, schema: OldUserStatisticsSchema },
        { name: Transactions.name, schema: TransactionsSchema },
        { name: Payments.name, schema: PaymentsSchema },
      ],
      'dev-db',
    ),
  ],
  controllers: [OldUserController],
  providers: [OldUserService],
  exports: [OldUserService],
})
export class OldUserModule {}
