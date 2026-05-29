import { Controller, Get, Param, Post } from '@nestjs/common';
import { HotelLikesService } from './hotel-reviews-likes.service';

@Controller('hotel-review-likes')
export class HotelLikesController {
  constructor(private readonly hotelLikesService: HotelLikesService) {}

  @Post(':reviewId/:userId')
  async likeReview(
    @Param('reviewId') reviewId: number,
    @Param('userId') userId: number,
  ) {
    return this.hotelLikesService.likeReview(reviewId, userId);
  }
}
