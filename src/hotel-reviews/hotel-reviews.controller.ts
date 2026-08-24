import { Controller, Post, Body, Param, Get, UseGuards, Delete, ParseIntPipe } from '@nestjs/common';
import { HotelReviewsService } from './hotel-reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('hotel-reviews')
export class HotelReviewsController {
  constructor(private readonly hotelReviewsService: HotelReviewsService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() body: CreateReviewDto, @GetUser('sub') userId: number) {
    return await this.hotelReviewsService.createReview(userId, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser('sub') userId: number) {
    return await this.hotelReviewsService.deleteReview(userId, id);
  }
}
