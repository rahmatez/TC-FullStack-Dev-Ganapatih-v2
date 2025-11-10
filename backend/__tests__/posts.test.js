import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('TC-2: Post Tests (Create & Validate)', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await cleanDatabase();

    // Register and login to get auth token
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: 'postuser',
        password: 'password123',
      });

    userId = registerResponse.body.user.id;

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'postuser',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('Create Post Tests', () => {
    test('[POSITIVE] Should create a post successfully with valid content', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a valid post within 200 characters!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('username', 'postuser');
      expect(response.body).toHaveProperty('content', 'This is a valid post within 200 characters!');
      expect(response.body).toHaveProperty('createdAt');
    });

    test('[POSITIVE] Should create a post with exactly 200 characters', async () => {
      const content200 = 'a'.repeat(200);
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: content200,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toHaveLength(200);
    });

    test('[NEGATIVE] Should return 422 when content exceeds 200 characters', async () => {
      const content201 = 'a'.repeat(201);

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: content201,
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details[0]).toHaveProperty('field', 'content');
      expect(response.body.details[0].message).toContain('200 characters');
    });

    test('[NEGATIVE] Should return 422 when content is empty', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details[0]).toHaveProperty('field', 'content');
    });

    test('[NEGATIVE] Should return 422 when content is missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    test('[NEGATIVE] Should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          content: 'This should fail without auth',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('[NEGATIVE] Should return 401 when auth token is invalid', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          content: 'This should fail with invalid token',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Get Posts Tests', () => {
    beforeAll(async () => {
      // Create some test posts
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Post 1' });

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Post 2' });

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Post 3' });
    });

    test('[POSITIVE] Should get user posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts/my-posts?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });

    test('[POSITIVE] Should get posts by username', async () => {
      const response = await request(app)
        .get('/api/posts/user/postuser?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
    });

    test('[NEGATIVE] Should return 404 when username does not exist', async () => {
      const response = await request(app)
        .get('/api/posts/user/nonexistentuser?page=1&limit=10')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Delete Post Tests', () => {
    let postId;
    let otherUserToken;

    beforeAll(async () => {
      // Create a post to delete
      const postResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Post to delete' });

      postId = postResponse.body.id;

      // Create another user
      await request(app)
        .post('/api/register')
        .send({
          username: 'otheruser',
          password: 'password123',
        });

      const otherLoginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'otheruser',
          password: 'password123',
        });

      otherUserToken = otherLoginResponse.body.token;
    });

    test('[POSITIVE] Should delete own post successfully', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post deleted successfully');
    });

    test('[NEGATIVE] Should return 404 when post does not exist', async () => {
      const response = await request(app)
        .delete('/api/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    test('[NEGATIVE] Should return 403 when trying to delete another user\'s post', async () => {
      // Create a post as first user
      const postResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Post by first user' });

      const newPostId = postResponse.body.id;

      // Try to delete as second user
      const response = await request(app)
        .delete(`/api/posts/${newPostId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'You can only delete your own posts');
    });
  });
});
