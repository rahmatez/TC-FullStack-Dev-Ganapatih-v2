import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean database before each test
export const cleanDatabase = async () => {
  // Delete in correct order to avoid foreign key constraints
  await prisma.follow.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});
};

// Cleanup after all tests
export const teardown = async () => {
  await cleanDatabase();
  await prisma.$disconnect();
};

export default prisma;
