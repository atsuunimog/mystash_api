import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './accounts.controller';
import { Accounts, AccountsSchema } from './accounts.schema';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Accounts.name, schema: AccountsSchema }],
      'service-db',
    ),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
