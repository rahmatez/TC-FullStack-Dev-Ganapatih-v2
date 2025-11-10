import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { paginationSchema } from '../validators/schemas.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get feed - posts from users that the current user follows
router.get('/', authenticateToken, validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Pull posts where the author is followed by the current user
    const feedFilter = {
      user: {
        following: {
          some: {
            followerId: userId,
          },
        },
      },
    };

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where: feedFilter,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: feedFilter,
      }),
    ]);

    if (total === 0) {
      return res.json({
        page,
        limit,
        total: 0,
        totalPages: 0,
        posts: [],
        message: 'You are not following anyone yet. Follow some users to see their posts!',
      });
    }

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      posts: posts.map((post) => ({
        id: post.id,
        userId: post.userId,
        username: post.user.username,
        content: post.content,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
