import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class HotelReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(body: CreateReviewDto) {
    // We use a transaction so both steps happen together or fail together
    return await this.prismaService.$transaction(async (tx) => {
      // Step 1: Create the new review row in PostgreSQL
      const newReview = await tx.hotelReviews.create({
        data: body,
      });

      // Step 2: Use Prisma Aggregate to compute the mathematical average (_avg)
      const aggregation = await tx.hotelReviews.aggregate({
        where: { hotelId: body.hotelId },
        _avg: {
          rating: true, // This targets the 'rating' field
        },
      });

      // Extract the average value (fallback to the incoming rating if it's the first review)
      const averageRating = aggregation._avg.rating ?? body.rating;

      // Step 3: Update the main Hotel record with the new rounded average
      // Note: Because your Prisma schema defines 'stars' as an Int, we use Math.round()
      await tx.hotel.update({
        where: { id: body.hotelId },
        data: {
          stars: Math.round(averageRating),
        },
      });

      // Return the newly created review back to the controller/frontend
      return newReview;
    });
  }
}
