import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StashesController } from './stashes.controller';
import { StashesService } from './stashes.service';
import { Stashes, StashesSchema } from './stashes.schema';
import { User, UserSchema } from '../../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Stashes.name, schema: StashesSchema }],
      'service-db',
    ),
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'auth-db',
    ),
  ],
  controllers: [StashesController],
  providers: [StashesService],
  exports: [StashesService],
})
export class StashesModule {}
