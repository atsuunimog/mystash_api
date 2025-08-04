import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interests, InterestsSchema } from './interests.schema';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Interests.name, schema: InterestsSchema }],
      'service-db',
    ),
  ],
  controllers: [InterestsController],
  providers: [InterestsService],
})
export class InterestsModule {}
