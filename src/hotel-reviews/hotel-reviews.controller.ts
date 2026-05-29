import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { HotelReviewsService } from './hotel-reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('hotel-reviews')
export class HotelReviewsController {
  constructor(private readonly hotelReviewsService: HotelReviewsService) {}

  @Post()
  async create(@Body() body: CreateReviewDto) {
    return await this.hotelReviewsService.createReview(body);
  }
}
