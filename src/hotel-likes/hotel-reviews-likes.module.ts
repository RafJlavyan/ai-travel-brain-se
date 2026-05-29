import { Module } from '@nestjs/common';
import { HotelLikesService } from './hotel-reviews-likes.service';
import { HotelLikesController } from './hotel-reviews-likes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HotelLikesService],
  controllers: [HotelLikesController],
})
export class HotelLikesModule {}
