import { PrismaClient } from '@prisma/client';

import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

import { encryptString } from '../src/shared/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('********** Seeding database **********');

  async function createRandomUser() {
    return {
      name: faker.person.firstName(),
      email: faker.internet.email(uuidv4()), //faker.internet.email(),
      password: 'tem2042acm1ptAA$$',
    };
  }

  const usersPromise = faker.helpers.multiple(createRandomUser, {
    count: 2000,
  });

  await prisma.user.deleteMany({});

  console.log('********** Users deleted **********');

  const users = await Promise.all(usersPromise);

  console.log('********** Users created **********');

  console.log({
    size: users.length,
  });

  await prisma.user.createMany({
    data: users,
  });

  console.log('********** Users saved **********');

  await prisma.user.upsert({
    where: { email: 'eduardo-266@hotmail.com' },
    update: {},
    create: {
      email: 'eduardo-266@hotmail.com',
      name: 'Eduardo',
      password: await encryptString('tem2042acm1ptAA$$'),
    },
  });

  console.log('********** Database seeded **********');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
