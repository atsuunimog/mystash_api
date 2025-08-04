import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transactions, TransactionsSchema } from './transactions.schema';
import { User, UserSchema } from '../../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Transactions.name, schema: TransactionsSchema }],
      'service-db',
    ),
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'auth-db',
    ),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
