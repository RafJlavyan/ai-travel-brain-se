import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class HotelReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(body: CreateReviewDto) {
    return await this.prismaService.hotelReviews.create({
      data: body,
    });
  }
}
