import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedHotels(prisma: PrismaClient) {
  console.log('🏨 Seeding 50 hotels...');

  const hotelsData = Array.from({ length: 50 }).map(() => {
    const hotelName = faker.company.name() + ' Hotel & Spa';
    const city = faker.location.city();
    const country = faker.location.country();

    return {
      name: hotelName,
      city: city,
      country: country,
      description: `Welcome to ${hotelName}, a beautiful property located in the heart of ${city}, ${country}. Enjoy premium amenities, exquisite dining, and world-class comfort.`,
      stars: 0,
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

  console.log(`✅ Successfully seeded ${createdHotels.count} hotels!`);
}
