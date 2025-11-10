import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('TC-3: Follow/Unfollow Tests', () => {
  let user1Token;
  let user1Id;
  let user2Id;
  let user3Id;

  beforeAll(async () => {
    await cleanDatabase();

    // Create user 1
    const user1Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'followuser1',
        password: 'password123',
      });
    user1Id = user1Reg.body.user.id;

    const user1Login = await request(app)
      .post('/api/login')
      .send({
        username: 'followuser1',
        password: 'password123',
      });
    user1Token = user1Login.body.token;

    // Create user 2
    const user2Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'followuser2',
        password: 'password123',
      });
    user2Id = user2Reg.body.user.id;

    // Create user 3
    const user3Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'followuser3',
        password: 'password123',
      });
    user3Id = user3Reg.body.user.id;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('Follow User Tests', () => {
    test('[POSITIVE] Should follow a valid user successfully', async () => {
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('following');

      // Verify follow relationship in database
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: user1Id,
            followeeId: user2Id,
          },
        },
      });

      expect(follow).not.toBeNull();
      expect(follow.followerId).toBe(user1Id);
      expect(follow.followeeId).toBe(user2Id);
    });

    test('[POSITIVE] Should be able to follow multiple users', async () => {
      const response = await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify both follows exist
      const follows = await prisma.follow.findMany({
        where: { followerId: user1Id },
      });

      expect(follows).toHaveLength(2);
    });

    test('[NEGATIVE] Should return 404 when trying to follow non-existent user', async () => {
      const response = await request(app)
        .post('/api/follow/99999')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('[NEGATIVE] Should return 400 when trying to follow self', async () => {
      const response = await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'You cannot follow yourself');
    });

    test('[NEGATIVE] Should return 400 when already following user', async () => {
      // user1 already follows user2 from previous test
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'You are already following this user');
    });

    test('[NEGATIVE] Should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Unfollow User Tests', () => {
    test('[POSITIVE] Should unfollow a user successfully', async () => {
      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('unfollowed');

      // Verify follow relationship is removed from database
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: user1Id,
            followeeId: user2Id,
          },
        },
      });

      expect(follow).toBeNull();
    });

    test('[NEGATIVE] Should return 404 when not following the user', async () => {
      // user1 already unfollowed user2
      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'You are not following this user');
    });

    test('[NEGATIVE] Should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Get Followers Tests', () => {
    beforeAll(async () => {
      // Setup: user2 and user3 follow user1
      const user2Login = await request(app)
        .post('/api/login')
        .send({
          username: 'followuser2',
          password: 'password123',
        });

      const user3Login = await request(app)
        .post('/api/login')
        .send({
          username: 'followuser3',
          password: 'password123',
        });

      await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Authorization', `Bearer ${user2Login.body.token}`);

      await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Authorization', `Bearer ${user3Login.body.token}`);
    });

    test('[POSITIVE] Should get list of followers', async () => {
      const response = await request(app)
        .get(`/api/follow/${user1Id}/followers`)
        .expect(200);

      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('followers');
      expect(response.body.followers).toBeInstanceOf(Array);
      expect(response.body.followers.length).toBeGreaterThan(0);
    });

    test('[POSITIVE] Should get list of following', async () => {
      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .expect(200);

      expect(response.body).toHaveProperty('following');
      expect(response.body.following).toBeInstanceOf(Array);
    });
  });

  describe('Check Follow Status Tests', () => {
    test('[POSITIVE] Should check if following a user', async () => {
      // user1 follows user3
      const response = await request(app)
        .get(`/api/follow/check/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('isFollowing');
      expect(typeof response.body.isFollowing).toBe('boolean');
    });

    test('[NEGATIVE] Should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/follow/check/${user3Id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });
});
