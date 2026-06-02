import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { HotelLikesService } from './hotel-reviews-likes.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('hotel-review-likes')
export class HotelLikesController {
  constructor(private readonly hotelLikesService: HotelLikesService) {}

  @UseGuards(JwtGuard)
  @Post(':reviewId')
  async likeReview(
    @Param('reviewId') reviewId: number,
    @GetUser('sub') userId: number,
  ) {
    return this.hotelLikesService.likeReview(reviewId, userId);
  }
}
