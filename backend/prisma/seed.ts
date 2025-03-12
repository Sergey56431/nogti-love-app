import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: 'Влад',
      lastName: 'Никифоров',
      phoneNumber: '+79502151980',
      password: '1234',
      birthday: new Date(2004, 7, 20),
      role: 'ADMIN',
    },
  });

  await prisma.calendar.createMany({
    data: [
      { date: new Date(2025, 3, 1), state: 'empty', userId: user1.id },
      { date: new Date(2025, 3, 2), state: 'have', userId: user1.id },
      { date: new Date(2025, 3, 15), state: 'notHave', userId: user1.id },
    ],
  });

  await prisma.directs.create({
    data: {
      phone: '+79502151980',
      clientName: 'Влад Никифоров',
      time: '12:00',
      comment: 'Комментарий к записи',
      userId: user1.id,
      calendarId: (
        await prisma.calendar.findFirst({
          where: { date: new Date(2025, 3, 2), userId: user1.id },
        })
      ).id,
    },
  });

  const categoryOperations = await prisma.categoryOperations.create({
    data: {
      name: 'Зарплата',
      userId: user1.id,
    },
  });

  await prisma.income_Expanses.create({
    data: {
      categoryId: categoryOperations.id,
      type: 'income',
      value: 50000,
      userId: user1.id,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Тестовая категория',
      userId: user1.id,
    },
  });

  await prisma.services.create({
    data: {
      name: 'Тестовая услуга',
      time: '1:30',
      price: 1500,
      categoryId: (
        await prisma.category.findFirst({
          where: { name: 'Тестовая категория' },
        })
      ).id,
    },
  });

  await prisma.directsServices.create({
    data: {
      serviceId: (
        await prisma.services.findFirst({ where: { name: 'Тестовая услуга' } })
      ).id,
      directId: (
        await prisma.directs.findFirst({
          where: { clientName: 'Влад Никифоров' },
        })
      ).id,
    },
  });
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
