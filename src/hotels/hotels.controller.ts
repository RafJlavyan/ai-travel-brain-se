import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { GetHotelsFilterDto } from './dto/get-hotels-filter.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { JwtPayload } from 'src/auth/types/auth.types';
import { RecommendationQueryDto } from './dto/recommendation-query.dto';

interface SaveSearchHistoryBody {
  query?: string;
}

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Get()
  getHotels(
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('minRating') minRating?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const filterDto: GetHotelsFilterDto = {
      search,
      country,
      minRating: minRating ? parseInt(minRating, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    };
    return this.hotelsService.findAll(filterDto);
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') query?: string) {
    if (!query || query.trim().length < 2) return [];
    return this.hotelsService.getSuggestions(query);
  }

  @UseGuards(JwtGuard)
  @Get('search-history/recent')
  getRecentSearches() {
    return this.hotelsService.getRecentSearches();
  }

  @UseGuards(JwtGuard)
  @Post('search-history')
  saveSearchHistory(@Body() body: SaveSearchHistoryBody) {
    return this.hotelsService.saveSearchHistory(body.query);
  }

  @Get(':id')
  getHotelById(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOne(id);
  }

  @Get(':id/reviews')
  getReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.hotelsService.findReviews(id, pageNum, limitNum);
  }

  @UseGuards(JwtGuard)
  @Get('personalized/suggestions')
  getPersonalizedSuggestions(
    @GetUser() user: JwtPayload,
    @Query() query: RecommendationQueryDto,
  ) {
    return this.hotelsService.getRecommendations(user.sub, query.limit);
  }
}
