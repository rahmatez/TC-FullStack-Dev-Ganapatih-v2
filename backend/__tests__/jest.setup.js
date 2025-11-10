import dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

// Set test database URL if available
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
