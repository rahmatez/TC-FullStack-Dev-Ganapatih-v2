import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema } from '../validators/schemas.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create a post
router.post('/', authenticateToken, validate(createPostSchema), async (req, res, next) => {
  try {
    const { content } = req.validatedData;
    const userId = req.user.userId;

    const post = await prisma.post.create({
      data: {
        content,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      id: post.id,
      userId: post.userId,
      username: post.user.username,
      content: post.content,
      createdAt: post.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's own posts
router.get('/my-posts', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
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
      prisma.post.count({ where: { userId } }),
    ]);

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

// Get posts by username
router.get('/user/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id },
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
      prisma.post.count({ where: { userId: user.id } }),
    ]);

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

// Delete a post
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        error: 'You can only delete your own posts',
      });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
