import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Climate, TravelStyle, BudgetRange, GroupType } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Climate)
  preferredClimate?: Climate;

  @IsEnum(TravelStyle)
  travelStyle: TravelStyle;

  @IsArray()
  @IsString({ each: true })
  preferredActivities?: string[];

  @IsArray()
  @IsString({ each: true })
  preferredRegions: string[];

  @IsEnum(BudgetRange)
  budgetRange: BudgetRange;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  homeCountry: string;

  @IsOptional()
  @IsEnum(GroupType)
  groupType?: GroupType;
}
