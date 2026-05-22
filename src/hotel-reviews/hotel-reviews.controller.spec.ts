import { Test, TestingModule } from '@nestjs/testing';
import { HotelReviewsController } from './hotel-reviews.controller';

describe('HotelReviewsController', () => {
  let controller: HotelReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelReviewsController],
    }).compile();

    controller = module.get<HotelReviewsController>(HotelReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
