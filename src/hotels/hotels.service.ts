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

  // FIXED: Added transaction isolation and fixed array index property reading crash bug
  async saveSearchHistory(searchQuery?: string) {
    const query = searchQuery?.trim();
    if (!query) return null;

    const matchedHotel = await this.prisma.hotel.findFirst({
      where: { name: { equals: query, mode: 'insensitive' } },
      select: { id: true },
    });

    // Run actions together inside a atomic transaction context
    return this.prisma.$transaction(async (tx) => {
      const newSearch = await tx.hotelSearchHistory.create({
        data: {
          query,
          hotelId: matchedHotel?.id ?? null,
        },
        include: { hotel: true },
      });

      const fifthRecord = await tx.hotelSearchHistory.findMany({
        orderBy: { createdAt: 'desc' },
        skip: 4,
        take: 1,
        select: { createdAt: true },
      });

      // CRITICAL FIX: Evaluated array elements safely via index boundaries [0]
      if (fifthRecord.length > 0) {
        await tx.hotelSearchHistory.deleteMany({
          where: {
            createdAt: {
              lt: fifthRecord[0].createdAt,
            },
          },
        });
      }

      return newSearch;
    });
  }

  async getRecentSearches(limit: number = 6) {
    const searches = await this.prisma.hotelSearchHistory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit * 4,
      include: {
        hotel: true,
      },
    });

    const seenQueries = new Set<string>();
    const recentSearches = searches.filter((search) => {
      const normalizedQuery = search.query.trim().toLowerCase();

      if (seenQueries.has(normalizedQuery)) {
        return false;
      }

      seenQueries.add(normalizedQuery);
      return true;
    });

    return recentSearches.slice(0, limit);
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

    const [reviews, totalCount] = await Promise.all([
      this.prisma.hotelReviews.findMany(reviewWithRelationsArgs),
      this.prisma.hotelReviews.count({ where: { hotelId } }),
    ]);

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
