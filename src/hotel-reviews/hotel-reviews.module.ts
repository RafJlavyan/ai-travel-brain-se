import { Module } from '@nestjs/common';
import { HotelReviewsController } from './hotel-reviews.controller';
import { HotelReviewsService } from './hotel-reviews.service';

@Module({
  controllers: [HotelReviewsController],
  providers: [HotelReviewsService]
})
export class HotelReviewsModule {}
