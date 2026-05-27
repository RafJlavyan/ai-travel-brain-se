import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

import { seedUsers } from './seeders/user.seeder';
import { seedHotels } from './seeders/hotel.seeder';

// 1. Initialize the mandatory PostgreSQL driver adapter for Prisma 7
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 2. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Execute seeders sequentially using the shared prisma client instance
  await seedUsers(prisma);
  await seedHotels(prisma);

  console.log('✅ Database seeding completed successfully.');
}

main()
  .then(async () => {
    // 3. Clean up all database connections on success
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
