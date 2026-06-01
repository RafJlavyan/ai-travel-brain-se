-- CreateEnum
CREATE TYPE "Climate" AS ENUM ('TROPICAL', 'COLD', 'DRY', 'MODERATE');

-- CreateEnum
CREATE TYPE "TravelStyle" AS ENUM ('ADVENTURE', 'RELAXATION', 'CULTURAL', 'BUSINESS', 'NIGHTLIFE');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('BUDGET', 'MID_RANGE', 'LUXURY');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('SOLO', 'COUPLE', 'FAMILY', 'FRIENDS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "budgetRange" "BudgetRange",
ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "groupType" "GroupType",
ADD COLUMN     "homeCountry" TEXT,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'hashed_password',
ADD COLUMN     "preferredActivities" TEXT[],
ADD COLUMN     "preferredClimate" "Climate",
ADD COLUMN     "preferredRegions" TEXT[],
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "travelStyle" "TravelStyle";
