import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../user/user.schema';
import { Accounts, AccountsSchema } from '../finance/accounts/accounts.schema';
import { Transactions, TransactionsSchema } from '../finance/transactions/transactions.schema';
import { Wallets, WalletsSchema } from '../finance/wallets/wallets.schema';
import { Stashes, StashesSchema } from '../finance/stashes/stashes.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'auth-db',
    ),
    MongooseModule.forFeature(
      [
        { name: Accounts.name, schema: AccountsSchema },
        { name: Transactions.name, schema: TransactionsSchema },
        { name: Wallets.name, schema: WalletsSchema },
        { name: Stashes.name, schema: StashesSchema },
      ],
      'service-db',
    ),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
