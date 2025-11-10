import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('API Tests - Users Endpoint', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await cleanDatabase();

    // Create and login user
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: 'apiuser',
        password: 'password123',
      });

    userId = registerResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'apiuser',
        password: 'password123',
      });

    authToken = loginResponse.body.token;

    // Create additional users for testing
    await request(app)
      .post('/api/register')
      .send({
        username: 'testuser1',
        password: 'password123',
      });

    await request(app)
      .post('/api/register')
      .send({
        username: 'testuser2',
        password: 'password123',
      });
  });

  afterAll(async () => {
    await teardown();
  });

  describe('GET /api/users - Get All Users', () => {
    test('[POSITIVE] Should get list of all users', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBeGreaterThan(0);

      // Check user object structure
      const user = response.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('postsCount');
      expect(user).toHaveProperty('followersCount');
      expect(user).toHaveProperty('followingCount');
    });

    test('[POSITIVE] Should get users with authentication and follow status', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users).toBeInstanceOf(Array);
      
      // Check for follow status when authenticated
      const user = response.body.users.find(u => u.id !== userId);
      if (user) {
        expect(user).toHaveProperty('isFollowing');
        expect(user).toHaveProperty('isSelf');
      }
    });

    test('[POSITIVE] Should search users by username', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10&search=testuser')
        .expect(200);

      expect(response.body.users).toBeInstanceOf(Array);
      
      // All returned users should match search
      response.body.users.forEach(user => {
        expect(user.username.toLowerCase()).toContain('testuser');
      });
    });

    test('[POSITIVE] Should paginate users correctly', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.users.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/users/:username - Get User Profile', () => {
    test('[POSITIVE] Should get user profile by username', async () => {
      const response = await request(app)
        .get('/api/users/apiuser')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'apiuser');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('postsCount');
      expect(response.body).toHaveProperty('followersCount');
      expect(response.body).toHaveProperty('followingCount');
    });

    test('[POSITIVE] Should get user profile with follow status when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/testuser1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', 'testuser1');
      expect(response.body).toHaveProperty('isFollowing');
      expect(response.body).toHaveProperty('isSelf');
      expect(response.body.isSelf).toBe(false);
    });

    test('[POSITIVE] Should identify own profile', async () => {
      const response = await request(app)
        .get('/api/users/apiuser')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('username', 'apiuser');
      expect(response.body).toHaveProperty('isSelf', true);
    });

    test('[NEGATIVE] Should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistentuser')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /api/users/me/profile - Get Current User Profile', () => {
    test('[POSITIVE] Should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('username', 'apiuser');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('postsCount');
      expect(response.body).toHaveProperty('followersCount');
      expect(response.body).toHaveProperty('followingCount');
    });

    test('[NEGATIVE] Should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('[NEGATIVE] Should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
