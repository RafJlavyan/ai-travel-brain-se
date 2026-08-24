import { ConflictException, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class HotelReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(userId: number, body: CreateReviewDto) {
    return await this.prismaService.$transaction(async (tx) => {
      let newReview;
      try {
        newReview = await tx.hotelReviews.create({
          data: {
            ...body,
            userId,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ConflictException('You have already reviewed this hotel.');
        }
        throw error;
      }

      const aggregation = await tx.hotelReviews.aggregate({
        where: { hotelId: body.hotelId },
        _avg: {
          rating: true,
        },
      });

      const averageRating = aggregation._avg.rating ?? body.rating;

      await tx.hotel.update({
        where: { id: body.hotelId },
        data: {
          stars: Math.round(averageRating),
        },
      });

      return newReview;
    });
  }

  async deleteReview(userId: number, reviewId: number) {
    const review = await this.prismaService.hotelReviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return await this.prismaService.$transaction(async (tx) => {
      const deleted = await tx.hotelReviews.delete({
        where: { id: reviewId },
      });

      const aggregation = await tx.hotelReviews.aggregate({
        where: { hotelId: review.hotelId },
        _avg: {
          rating: true,
        },
      });

      const averageRating = aggregation._avg.rating ?? 0;

      await tx.hotel.update({
        where: { id: review.hotelId },
        data: {
          stars: Math.round(averageRating),
        },
      });

      return deleted;
    });
  }
}
