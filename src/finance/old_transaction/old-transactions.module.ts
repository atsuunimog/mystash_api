import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OldTransactionsController } from './old-transactions.controller';
import { OldTransactionsService } from './old-transactions.service';
import {
  OldTransactions,
  OldTransactionsSchema,
} from './old-transactions.schema';
import { OldUser, OldUserSchema } from '../../old_user/old_user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: OldUser.name, schema: OldUserSchema },
        { name: OldTransactions.name, schema: OldTransactionsSchema },
      ],
      'dev-db',
    ),
  ],
  controllers: [OldTransactionsController],
  providers: [OldTransactionsService],
})
export class OldTransactionsModule {}
