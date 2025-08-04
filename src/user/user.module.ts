import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { Stashes, StashesSchema } from '../finance/stashes/stashes.schema';
import { Wallets, WalletsSchema } from '../finance/wallets/wallets.schema';
import { Transactions, TransactionsSchema } from '../finance/transactions/transactions.schema';
import { Payments, PaymentsSchema } from '../finance/payments/payments.schema';
import { Transfers, TransfersSchema } from '../finance/transfers/transfer.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'auth-db',
    ),
    MongooseModule.forFeature(
      [
        { name: Stashes.name, schema: StashesSchema },
        { name: Wallets.name, schema: WalletsSchema },
        { name: Transactions.name, schema: TransactionsSchema },
        { name: Payments.name, schema: PaymentsSchema },
        { name: Transfers.name, schema: TransfersSchema },
      ],
      'service-db',
    ),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
