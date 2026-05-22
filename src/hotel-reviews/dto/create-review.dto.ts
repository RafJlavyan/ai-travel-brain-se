import { IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    hotelId: number;

    @IsNumber()
    userId: number;

    @IsNumber()
    rating: number;

    @IsString()
    @Min(1)
    @Max(5)
    review: string;
}