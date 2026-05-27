import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Seeding 10 users...');

  // Generate 10 mock users matching your schema
  const usersData = Array.from({ length: 10 }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName: firstName,
      lastName: lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    };
  });

  const createdUsers = await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true, // Prevents crashes if an email collision occurs
  });

  console.log(`✅ Successfully seeded ${createdUsers.count} users!`);
}
