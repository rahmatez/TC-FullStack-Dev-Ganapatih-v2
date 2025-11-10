import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.follow.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      username: 'alice',
      passwordHash: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'bob',
      passwordHash: hashedPassword,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'charlie',
      passwordHash: hashedPassword,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      username: 'diana',
      passwordHash: hashedPassword,
    },
  });

  console.log('Users created:', { user1, user2, user3, user4 });

  // Create posts
  await prisma.post.createMany({
    data: [
      {
        content: 'Hello everyone! This is my first post.',
        userId: user1.id,
      },
      {
        content: 'Beautiful day today! ☀️',
        userId: user1.id,
      },
      {
        content: 'Just finished reading an amazing book!',
        userId: user2.id,
      },
      {
        content: 'Anyone interested in web development?',
        userId: user2.id,
      },
      {
        content: 'Working on a new project. Exciting times!',
        userId: user3.id,
      },
      {
        content: 'Coffee and coding - perfect combination!',
        userId: user3.id,
      },
      {
        content: 'Learning React today 🚀',
        userId: user4.id,
      },
      {
        content: 'Good morning everyone!',
        userId: user4.id,
      },
    ],
  });

  console.log('Posts created');

  // Create follows
  await prisma.follow.createMany({
    data: [
      // Alice follows Bob and Charlie
      { followerId: user1.id, followeeId: user2.id },
      { followerId: user1.id, followeeId: user3.id },
      // Bob follows Alice and Diana
      { followerId: user2.id, followeeId: user1.id },
      { followerId: user2.id, followeeId: user4.id },
      // Charlie follows everyone
      { followerId: user3.id, followeeId: user1.id },
      { followerId: user3.id, followeeId: user2.id },
      { followerId: user3.id, followeeId: user4.id },
      // Diana follows Alice
      { followerId: user4.id, followeeId: user1.id },
    ],
  });

  console.log('Follows created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
