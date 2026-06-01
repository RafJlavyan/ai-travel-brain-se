-- Fill existing NULL values before making columns required
UPDATE "User" SET "preferredClimate" = 'MODERATE' WHERE "preferredClimate" IS NULL;
UPDATE "User" SET "travelStyle" = 'RELAXATION' WHERE "travelStyle" IS NULL;
UPDATE "User" SET "budgetRange" = 'MID_RANGE' WHERE "budgetRange" IS NULL;
UPDATE "User" SET "homeCountry" = 'Unknown' WHERE "homeCountry" IS NULL;
UPDATE "User" SET "groupType" = 'SOLO' WHERE "groupType" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "budgetRange" SET NOT NULL,
ALTER COLUMN "budgetRange" SET DEFAULT 'MID_RANGE',
ALTER COLUMN "groupType" SET DEFAULT 'SOLO',
ALTER COLUMN "homeCountry" SET NOT NULL,
ALTER COLUMN "homeCountry" SET DEFAULT 'Unknown',
ALTER COLUMN "preferredActivities" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "preferredClimate" SET NOT NULL,
ALTER COLUMN "preferredClimate" SET DEFAULT 'MODERATE',
ALTER COLUMN "preferredRegions" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "travelStyle" SET NOT NULL,
ALTER COLUMN "travelStyle" SET DEFAULT 'RELAXATION';