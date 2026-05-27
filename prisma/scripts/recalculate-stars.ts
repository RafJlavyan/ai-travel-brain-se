import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// 1. Initialize with your PostgreSQL Driver Adapter setup
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Starting full hotel stars recalculation...');

  // 2. Fetch all hotel IDs from the database
  const hotels = await prisma.hotel.findMany({
    select: { id: true, name: true },
  });

  console.log(`Found ${hotels.length} hotels to process.`);

  // 3. Loop through each hotel and recalculate its average rating
  for (const hotel of hotels) {
    // Run the aggregate query to find the average score
    const aggregation = await prisma.hotelReviews.aggregate({
      where: { hotelId: hotel.id },
      _avg: {
        rating: true,
      },
    });

    const averageRating = aggregation._avg.rating;

    // If a hotel has reviews, calculate its rounded average.
    // If a hotel has 0 reviews, we default its rating to a fallback (like 3 stars)
    if (averageRating !== null) {
      const roundedStars = Math.round(averageRating);

      await prisma.hotel.update({
        where: { id: hotel.id },
        data: { stars: 0 },
      });

      console.log(
        `✅ Updated ${hotel.name}: New Rating = ${roundedStars} stars`,
      );
    } else {
      console.log(`ℹ️ Skipped ${hotel.name}: No reviews found yet.`);
    }
  }

  console.log('🎉 Full database recalculation complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating hotel stars:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
