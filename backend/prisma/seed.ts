import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { slug: 'badrumsrenovering', nameSv: 'Badrumsrenovering', rotEligible: true, rutEligible: false },
    { slug: 'koksrenovering', nameSv: 'Köksrenovering', rotEligible: true, rutEligible: false },
    { slug: 'malning', nameSv: 'Målning', rotEligible: true, rutEligible: false },
    { slug: 'snickeri', nameSv: 'Snickeri', rotEligible: true, rutEligible: false },
    { slug: 'el-arbete', nameSv: 'El-arbete', rotEligible: true, rutEligible: false },
    { slug: 'vvs-rormokeri', nameSv: 'VVS/Rörmokeri', rotEligible: true, rutEligible: false },
    { slug: 'golvlaggning', nameSv: 'Golvläggning', rotEligible: true, rutEligible: false },
    { slug: 'takarbete', nameSv: 'Takarbete', rotEligible: true, rutEligible: false },
    { slug: 'tradgardsarbete', nameSv: 'Trädgårdsarbete', rotEligible: false, rutEligible: true },
    { slug: 'flytt-stadning', nameSv: 'Flyttstädning', rotEligible: false, rutEligible: true },
    { slug: 'hemstadning', nameSv: 'Hemstädning', rotEligible: false, rutEligible: true },
    { slug: 'fonster-puts', nameSv: 'Fönsterputs', rotEligible: false, rutEligible: true },
    { slug: 'flytthjalp', nameSv: 'Flytthjälp', rotEligible: false, rutEligible: true },
    { slug: 'ovrigt', nameSv: 'Övrigt', rotEligible: false, rutEligible: false },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Demo business user
  const passwordHash = await bcrypt.hash('demo1234', 12);
  await prisma.business.upsert({
    where: { email: 'demo@svara.se' },
    update: {},
    create: {
      name: 'Demo Företag AB',
      email: 'demo@svara.se',
      passwordHash,
      notificationEmail: 'demo@svara.se',
    },
  });

  // Postnummer geo seed (ballpark, extend with full dataset)
  const geoData = [
    { postalCode: '11120', kommun: 'Stockholm', lan: 'Stockholms län' },
    { postalCode: '41101', kommun: 'Göteborg', lan: 'Västra Götalands län' },
    { postalCode: '21120', kommun: 'Malmö', lan: 'Skåne län' },
    { postalCode: '75220', kommun: 'Uppsala', lan: 'Uppsala län' },
    { postalCode: '58220', kommun: 'Linköping', lan: 'Östergötlands län' },
    { postalCode: '60220', kommun: 'Norrköping', lan: 'Östergötlands län' },
    { postalCode: '30220', kommun: 'Halmstad', lan: 'Hallands län' },
    { postalCode: '85220', kommun: 'Sundsvall', lan: 'Västernorrlands län' },
  ];

  for (const geo of geoData) {
    await prisma.postnummerGeo.upsert({
      where: { postalCode: geo.postalCode },
      update: {},
      create: geo,
    });
  }

  console.log('Seed klar!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
