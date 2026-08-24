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

  async saveSearchHistory(searchQuery?: string) {
    const query = searchQuery?.trim();
    if (!query) return null;

    const matchedHotel = await this.prisma.hotel.findFirst({
      where: { name: { equals: query, mode: 'insensitive' } },
      select: { id: true },
    });

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
    // 1. Fetch current user's review if they are logged in
    let myReview: any = null;
    if (currentUserId) {
      myReview = await this.prisma.hotelReviews.findFirst({
        where: { hotelId, userId: currentUserId },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          likes: { where: { userId: currentUserId }, select: { id: true } },
          _count: {
            select: { likes: true },
          },
        },
      });
    }

    // 2. Calculate skip/take for other reviews
    let skip = (page - 1) * limit;
    let take = limit;

    if (myReview) {
      if (page === 1) {
        take = limit - 1; // Since we include myReview, take one less
      } else {
        skip = (page - 1) * limit - 1; // Shift skip index because myReview was taken on page 1
      }
    }

    // 3. Query other reviews (excluding current user's review if it exists)
    const otherReviews = await this.prisma.hotelReviews.findMany({
      where: {
        hotelId,
        ...(currentUserId ? { NOT: { userId: currentUserId } } : {}),
      },
      skip,
      take,
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

    // 4. Combine reviews
    const combinedReviews: any[] = [];
    if (page === 1 && myReview) {
      combinedReviews.push(myReview);
    }
    combinedReviews.push(...otherReviews);

    // 5. Total count includes all reviews
    const totalCount = await this.prisma.hotelReviews.count({
      where: { hotelId },
    });

    const formattedReviews = combinedReviews.map((review) => ({
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

  async getRecommendations(userId: number, limit: number = 5) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredClimate: true,
        travelStyle: true,
        preferredActivities: true,
        budgetRange: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.prisma.hotel.findMany({
      where: {
        OR: [
          {
            tags: {
              hasSome: user.preferredActivities,
            },
          },
          {
            description: {
              contains: user.travelStyle ?? '',
              mode: 'insensitive',
            },
          },
          {
            stars: user.budgetRange === 'LUXURY' ? { gte: 4 } : { lte: 4 },
          },
        ],
      },
      orderBy: [{ stars: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
    });
  }
}
