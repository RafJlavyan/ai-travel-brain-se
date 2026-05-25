import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import pg from 'pg';
import 'dotenv/config';

// 1. Set up the PostgreSQL driver connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 2. Pass the adapter to the PrismaClient options
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding 50 hotels...');

  const hotelsData = Array.from({ length: 50 }).map(() => {
    const hotelName = faker.company.name() + ' Hotel & Spa';
    const city = faker.location.city();
    const country = faker.location.country();

    return {
      name: hotelName,
      city: city,
      country: country,
      description: `Welcome to ${hotelName}, a beautiful property located in the heart of ${city}, ${country}. Enjoy premium amenities, exquisite dining, and world-class comfort.`,
      stars: faker.number.int({ min: 1, max: 5 }),
      pricePerNight: parseFloat(
        faker.commerce.price({ min: 50, max: 450, dec: 2 }),
      ),
      image: faker.image.urlLoremFlickr({
        category: 'hotel,room',
        width: 640,
        height: 480,
      }),
    };
  });

  const createdHotels = await prisma.hotel.createMany({
    data: hotelsData,
  });

  console.log(`Successfully seeded ${createdHotels.count} hotels!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 3. Clean up connections when finished
    await prisma.$disconnect();
    await pool.end();
  });
