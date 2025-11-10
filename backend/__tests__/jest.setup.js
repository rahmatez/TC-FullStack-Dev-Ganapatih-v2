import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config();

// Set test database URL if available
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Global teardown - disconnect all Prisma instances after all tests
afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});
