import { Module } from '@nestjs/common';
import { HotelReviewsController } from './hotel-reviews.controller';
import { HotelReviewsService } from './hotel-reviews.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HotelReviewsController],
  providers: [HotelReviewsService],
})
export class HotelReviewsModule {}
