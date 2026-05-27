import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(readonly prisma: PrismaService) {}

  async create(data: CreateHotelDto) {
    return this.prisma.hotel.create({ data });
  }

  async findAll() {
    return await this.prisma.hotel.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async findReviews(hotelId: number, page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    // Run parallel database queries for optimal performance
    const [reviews, totalCount] = await Promise.all([
      this.prisma.hotelReviews.findMany({
        where: { hotelId },
        skip: skip,
        take: limit, // Only fetches 5 reviews at a time
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.hotelReviews.count({ where: { hotelId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total: totalCount,
        page,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }
}
