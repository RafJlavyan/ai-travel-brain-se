import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHotelDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly stars: number;

  @IsNotEmpty()
  @IsNumber()
  readonly pricePerNight: number;

  @IsString()
  @IsOptional()
  readonly image: string;
}
