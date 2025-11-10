import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Follow a user
router.post('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.userId;

    // Check if trying to follow self
    if (followerId === followeeId) {
      return res.status(400).json({
        error: 'You cannot follow yourself',
      });
    }

    // Check if followee exists
    const followee = await prisma.user.findUnique({
      where: { id: followeeId },
    });

    if (!followee) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        error: 'You are already following this user',
      });
    }

    // Create follow
    await prisma.follow.create({
      data: {
        followerId,
        followeeId,
      },
    });

    res.json({
      message: `You are now following ${followee.username}`,
    });
  } catch (error) {
    next(error);
  }
});

// Unfollow a user
router.delete('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.userId;

    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
      include: {
        followee: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!follow) {
      return res.status(404).json({
        error: 'You are not following this user',
      });
    }

    // Delete follow
    await prisma.follow.delete({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    res.json({
      message: `You unfollowed ${follow.followee.username}`,
    });
  } catch (error) {
    next(error);
  }
});

// Get followers of a user
router.get('/:userId/followers', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followeeId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followeeId: userId } }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      followers: followers.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get users that a user is following
router.get('/:userId/following', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          followee: {
            select: {
              id: true,
              username: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      following: following.map((f) => ({
        id: f.followee.id,
        username: f.followee.username,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Check if current user follows a specific user
router.get('/check/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.userId;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    res.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
