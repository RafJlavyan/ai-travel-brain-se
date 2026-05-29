import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HotelLikesService {
  constructor(readonly prisma: PrismaService) {}

  async likeReview(reviewId: number, userId: number) {
    const like = await this.prisma.reviewLike.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });

    if (like) {
      await this.prisma.reviewLike.delete({
        where: { id: like.id },
      });
      return { action: 'unliked' };
    } else {
      await this.prisma.reviewLike.create({
        data: { reviewId, userId },
      });
      return { action: 'liked' };
    }
  }
}
