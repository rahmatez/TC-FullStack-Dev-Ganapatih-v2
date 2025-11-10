import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users with pagination
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search
      ? {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // If user is authenticated, check follow status
    let usersWithFollowStatus = users;
    if (req.user) {
      const currentUserId = req.user.userId;
      const followStatuses = await Promise.all(
        users.map(async (user) => {
          if (user.id === currentUserId) {
            return { ...user, isFollowing: false, isSelf: true };
          }
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followeeId: {
                followerId: currentUserId,
                followeeId: user.id,
              },
            },
          });
          return { ...user, isFollowing: !!follow, isSelf: false };
        })
      );
      usersWithFollowStatus = followStatuses;
    }

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users: usersWithFollowStatus.map((user) => ({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        ...(req.user && { isFollowing: user.isFollowing, isSelf: user.isSelf }),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile by username
router.get('/:username', optionalAuth, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Check follow status if user is authenticated
    let isFollowing = false;
    let isSelf = false;
    if (req.user) {
      isSelf = req.user.userId === user.id;
      if (!isSelf) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followeeId: {
              followerId: req.user.userId,
              followeeId: user.id,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      ...(req.user && { isFollowing, isSelf }),
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
