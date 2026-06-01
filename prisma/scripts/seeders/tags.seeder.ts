import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// 1. Initialize your exact driver adapter setup
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Fetching all existing hotels using driver adapter...');
  const hotels = await prisma.hotel.findMany();

  console.log(`🏨 Found ${hotels.length} hotels. Analyzing metadata...`);

  for (const hotel of hotels) {
    const generatedTags: string[] = [];
    const textToAnalyze =
      `${hotel.name} ${hotel.city} ${hotel.country} ${hotel.description}`.toLowerCase();

    // ——————————————————————————————————————————————————————————
    // 1. Match CLIMATE Enums
    // ——————————————————————————————————————————————————————————
    if (
      textToAnalyze.match(
        /(beach|island|resort|summer|sea|sun|warm|egypt|thailand|bali)/,
      )
    ) {
      generatedTags.push('TROPICAL');
    } else if (
      textToAnalyze.match(
        /(snow|ski|mountain|winter|ice|cold|alps|switzerland)/,
      )
    ) {
      generatedTags.push('COLD');
    } else if (textToAnalyze.match(/(desert|safari|egypt|dubai|dry|canyon)/)) {
      generatedTags.push('DRY');
    } else {
      generatedTags.push('MODERATE');
    }

    // ——————————————————————————————————————————————————————————
    // 2. Match TRAVEL STYLE Enums
    // ——————————————————————————————————————————————————————————
    if (
      textToAnalyze.match(/(hiking|climbing|safari|diving|surf|explore|trek)/)
    ) {
      generatedTags.push('ADVENTURE');
    }
    if (textToAnalyze.match(/(spa|pool|relax|massage|quiet|wellness|calm)/)) {
      generatedTags.push('RELAXATION');
    }
    if (
      textToAnalyze.match(
        /(museum|history|old town|center|tour|castle|culture)/,
      )
    ) {
      generatedTags.push('CULTURAL');
    }
    if (
      textToAnalyze.match(
        /(business|conference|meeting|workspace|airport|wifi)/,
      )
    ) {
      generatedTags.push('BUSINESS');
    }
    if (textToAnalyze.match(/(bar|club|nightlife|party|pub|lounge)/)) {
      generatedTags.push('NIGHTLIFE');
    }

    // ——————————————————————————————————————————————————————————
    // 3. Match BUDGET RANGE Enums (Based on pricing or stars)
    // ——————————————————————————————————————————————————————————
    if (hotel.pricePerNight >= 250 || hotel.stars === 5) {
      generatedTags.push('LUXURY');
    } else if (hotel.pricePerNight >= 90 || hotel.stars >= 3) {
      generatedTags.push('MID_RANGE');
    } else {
      generatedTags.push('BUDGET');
    }

    // ——————————————————————————————————————————————————————————
    // 4. Match GROUP TYPE Enums
    // ——————————————————————————————————————————————————————————
    if (textToAnalyze.match(/(family|kids|playground|children|aquapark)/)) {
      generatedTags.push('FAMILY');
    }
    if (textToAnalyze.match(/(romantic|couple|honeymoon|adults only)/)) {
      generatedTags.push('COUPLE');
    }
    if (textToAnalyze.match(/(hostel|backpacker|solo|business)/)) {
      generatedTags.push('SOLO');
    }
    if (
      textToAnalyze.match(/(group|friends|villa|spacious)/) ||
      generatedTags.includes('NIGHTLIFE')
    ) {
      generatedTags.push('FRIENDS');
    }

    // Default Fallback
    if (
      !generatedTags.includes('RELAXATION') &&
      !generatedTags.includes('ADVENTURE')
    ) {
      generatedTags.push('RELAXATION');
    }

    // Combine any manually set tags with generated tags and drop duplicates
    const finalTags = Array.from(
      new Set([...(hotel.tags || []), ...generatedTags]),
    );

    // 2. Perform the database write update
    await prisma.hotel.update({
      where: { id: hotel.id },
      data: { tags: finalTags },
    });

    console.log(`✅ Updated: "${hotel.name}" -> [${finalTags.join(', ')}]`);
  }

  console.log('🎉 Data migration completed successfully.');
}

// 3. Clean up the script connection lifecycle hooks matching your workflow
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
