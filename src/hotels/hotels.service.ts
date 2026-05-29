import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetHotelsFilterDto } from './dto/get-hotels-filter.dto';

@Injectable()
export class HotelsService {
  constructor(readonly prisma: PrismaService) {}

  async create(data: CreateHotelDto) {
    return this.prisma.hotel.create({ data });
  }

  async findAll(filterDto: GetHotelsFilterDto) {
    const { country, search, minRating, maxPrice } = filterDto;
    const where: Prisma.HotelWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (country) {
      where.country = {
        equals: country,
        mode: 'insensitive',
      };
    }

    if (minRating) {
      where.stars = { gte: minRating };
    }

    if (maxPrice) {
      where.pricePerNight = { lte: maxPrice };
    }

    return await this.prisma.hotel.findMany({
      where,
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

  async getSuggestions(searchQuery: string) {
    const matches = await this.prisma.hotel.findMany({
      where: {
        OR: [
          { name: { startsWith: searchQuery, mode: 'insensitive' } },
          { city: { startsWith: searchQuery, mode: 'insensitive' } },
          { country: { startsWith: searchQuery, mode: 'insensitive' } },
        ],
      },
      select: { name: true, city: true, country: true },
      take: 5,
    });

    const suggestions = new Set<string>();

    matches.forEach((hotel) => {
      if (hotel.name.toLowerCase().startsWith(searchQuery.toLowerCase()))
        suggestions.add(hotel.name);
      if (hotel.city.toLowerCase().startsWith(searchQuery.toLowerCase()))
        suggestions.add(hotel.city);
      if (hotel.country.toLowerCase().startsWith(searchQuery.toLowerCase()))
        suggestions.add(hotel.country);
    });

    return Array.from(suggestions);
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

  async findReviews(
    hotelId: number,
    page: number = 1,
    limit: number = 5,
    currentUserId?: number,
  ) {
    const skip = (page - 1) * limit;

    // 2. Explicitly type the shape of the query to match your exact include parameters
    const reviewWithRelationsArgs =
      Prisma.validator<Prisma.HotelReviewsFindManyArgs>()({
        where: { hotelId },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          likes: currentUserId
            ? { where: { userId: currentUserId }, select: { id: true } }
            : false,
          _count: {
            select: { likes: true },
          },
        },
      });

    // 3. Force TypeScript to enforce the exact nested model properties inside Promise.all
    const [reviews, totalCount] = await Promise.all([
      this.prisma.hotelReviews.findMany(reviewWithRelationsArgs),
      this.prisma.hotelReviews.count({ where: { hotelId } }),
    ]);

    // 4. Map entries safely. TypeScript will now accurately autocomplete 'user', '_count', and 'likes'!
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt,
      user: review.user,
      likesCount: review._count?.likes ?? 0,
      isLiked: Array.isArray(review.likes) ? review.likes.length > 0 : false,
    }));

    return {
      data: formattedReviews,
      meta: {
        total: totalCount,
        page,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }
}
