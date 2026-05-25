import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  hotelId: number;

  @IsNumber()
  userId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  review: string;
}
