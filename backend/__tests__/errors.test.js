import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('API Tests - Error Handling & Edge Cases', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await cleanDatabase();

    // Create and login user
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    userId = registerResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('Validation Errors', () => {
    test('[NEGATIVE] Should reject registration with missing username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          password: 'password123',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    test('[NEGATIVE] Should reject registration with short username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'ab',
          password: 'password123',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    test('[NEGATIVE] Should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'validuser',
          password: '12345',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });

    test('[NEGATIVE] Should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({})
        .expect(422);

      expect(response.body).toHaveProperty('error');
    });

    test('[NEGATIVE] Should reject post with empty content', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error');
    });

    test('[NEGATIVE] Should reject post with content exceeding 200 characters', async () => {
      const longContent = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: longContent,
        })
        .expect(422);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Authentication Errors', () => {
    test('[NEGATIVE] Should return 401 when accessing protected route without token', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          content: 'Test post',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('[NEGATIVE] Should return 401 with malformed token', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer notavalidtoken')
        .send({
          content: 'Test post',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('[NEGATIVE] Should return 401 without Bearer prefix', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', authToken)
        .send({
          content: 'Test post',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('[NEGATIVE] Should reject token refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({
          refreshToken: 'invalid.refresh.token',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Not Found Errors', () => {
    test('[NEGATIVE] Should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('[NEGATIVE] Should return 404 when deleting non-existent post', async () => {
      const response = await request(app)
        .delete('/api/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    test('[NEGATIVE] Should return 404 for non-existent user profile', async () => {
      const response = await request(app)
        .get('/api/users/nonexistentuser123')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Conflict Errors', () => {
    test('[NEGATIVE] Should return 409 when registering duplicate username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser', // Already exists
          password: 'password123',
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    test('[NEGATIVE] Should return 400 when following same user twice', async () => {
      // Create another user to follow
      const user2Response = await request(app)
        .post('/api/register')
        .send({
          username: 'followtest',
          password: 'password123',
        });

      const user2Id = user2Response.body.user.id;

      // Follow once
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to follow again
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'You are already following this user');
    });

    test('[NEGATIVE] Should return 404 when unfollowing user not followed', async () => {
      // Create another user
      const user3Response = await request(app)
        .post('/api/register')
        .send({
          username: 'unfollowtest',
          password: 'password123',
        });

      const user3Id = user3Response.body.user.id;

      // Try to unfollow without following first
      const response = await request(app)
        .delete(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'You are not following this user');
    });

    test('[NEGATIVE] Should return 400 when trying to follow yourself', async () => {
      const response = await request(app)
        .post(`/api/follow/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'You cannot follow yourself');
    });
  });

  describe('Authorization Errors', () => {
    test('[NEGATIVE] Should return 403 when deleting another user\'s post', async () => {
      // Create another user
      const user2Response = await request(app)
        .post('/api/register')
        .send({
          username: 'otheruser',
          password: 'password123',
        });

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'otheruser',
          password: 'password123',
        });

      const user2Token = loginResponse.body.token;

      // Create post as user2
      const postResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          content: 'Post by other user',
        });

      const postId = postResponse.body.id;

      // Try to delete as original user
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'You can only delete your own posts');
    });
  });

  describe('Input Sanitization', () => {
    test('[SECURITY] Should reject special characters in username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'user<script>alert("xss")</script>',
          password: 'password123',
        })
        .expect(422);

      // Validation should prevent special characters
      expect(response.body).toHaveProperty('error');
    });

    test('[SECURITY] Should handle special characters in post content', async () => {
      const content = '<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content,
        })
        .expect(201);

      // Content should be stored as-is (frontend should handle sanitization)
      expect(response.body.content).toBe(content);
    });

    test('[SECURITY] Should handle SQL-like syntax in search', async () => {
      const response = await request(app)
        .get('/api/users?search=test\' OR 1=1--')
        .expect(200);

      // Should not cause SQL injection
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toBeInstanceOf(Array);
    });
  });

  describe('Pagination Edge Cases', () => {
    test('[EDGE] Should handle invalid page number', async () => {
      const response = await request(app)
        .get('/api/users?page=0&limit=10')
        .expect(200);

      // Should default to page 1
      expect(response.body.page).toBe(1);
    });

    test('[EDGE] Should handle invalid limit', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=0')
        .expect(200);

      // Should use default limit
      expect(response.body.limit).toBeGreaterThan(0);
    });

    test('[EDGE] Should handle very large page number', async () => {
      const response = await request(app)
        .get('/api/users?page=999999&limit=10')
        .expect(200);

      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBe(0);
    });
  });

  describe('Concurrent Requests', () => {
    test('[EDGE] Should handle multiple simultaneous post creations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: `Concurrent post ${i}`,
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
      });
    });

    test('[EDGE] Should handle concurrent follow/unfollow operations', async () => {
      // Create target user
      const targetResponse = await request(app)
        .post('/api/register')
        .send({
          username: 'concurrenttarget',
          password: 'password123',
        });

      const targetId = targetResponse.body.user.id;

      // Multiple follow attempts
      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post(`/api/follow/${targetId}`)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);

      // Only first should succeed, others should get 400
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(1);
    });
  });
});
