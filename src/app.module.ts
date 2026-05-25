import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelsModule } from './hotels/hotels.module';
import { PrismaModule } from './prisma/prisma.module';
import { HotelReviewsModule } from './hotel-reviews/hotel-reviews.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [HotelsModule, PrismaModule, HotelReviewsModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
