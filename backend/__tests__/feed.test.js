import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('TC-4: Feed Tests', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let user3Token;
  let user3Id;

  beforeAll(async () => {
    await cleanDatabase();

    // Create user 1
    const user1Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'feeduser1',
        password: 'password123',
      });
    user1Id = user1Reg.body.user.id;

    const user1Login = await request(app)
      .post('/api/login')
      .send({
        username: 'feeduser1',
        password: 'password123',
      });
    user1Token = user1Login.body.token;

    // Create user 2
    const user2Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'feeduser2',
        password: 'password123',
      });
    user2Id = user2Reg.body.user.id;

    const user2Login = await request(app)
      .post('/api/login')
      .send({
        username: 'feeduser2',
        password: 'password123',
      });
    user2Token = user2Login.body.token;

    // Create user 3
    const user3Reg = await request(app)
      .post('/api/register')
      .send({
        username: 'feeduser3',
        password: 'password123',
      });
    user3Id = user3Reg.body.user.id;

    const user3Login = await request(app)
      .post('/api/login')
      .send({
        username: 'feeduser3',
        password: 'password123',
      });
    user3Token = user3Login.body.token;

    // User 2 creates posts
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Post from user2 - first' });

    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Post from user2 - second' });

    // User 3 creates posts
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user3Token}`)
      .send({ content: 'Post from user3 - first' });

    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user3Token}`)
      .send({ content: 'Post from user3 - second' });
  });

  afterAll(async () => {
    await teardown();
  });

  describe('Feed Display Tests', () => {
    test('[POSITIVE] Should display posts from followed users sorted by newest first', async () => {
      // User 1 follows user 2 and user 3
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      // Get feed
      const response = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThan(0);

      // Verify posts are from followed users only
      const posts = response.body.posts;
      posts.forEach(post => {
        expect([user2Id, user3Id]).toContain(post.userId);
      });

      // Verify posts are sorted by newest first (descending created_at)
      for (let i = 0; i < posts.length - 1; i++) {
        const currentPostDate = new Date(posts[i].createdAt);
        const nextPostDate = new Date(posts[i + 1].createdAt);
        expect(currentPostDate.getTime()).toBeGreaterThanOrEqual(nextPostDate.getTime());
      }
    });

    test('[POSITIVE] Should only show posts from followed users', async () => {
      // User 1 already follows user2 and user3
      // Create user 4 who is not followed
      const user4Reg = await request(app)
        .post('/api/register')
        .send({
          username: 'feeduser4',
          password: 'password123',
        });

      const user4Login = await request(app)
        .post('/api/login')
        .send({
          username: 'feeduser4',
          password: 'password123',
        });

      // User 4 creates a post
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user4Login.body.token}`)
        .send({ content: 'Post from user4 - should not appear in user1 feed' });

      // Get feed as user 1
      const response = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Verify user4's post is not in the feed
      const posts = response.body.posts;
      const user4Posts = posts.filter(post => post.userId === user4Reg.body.user.id);
      expect(user4Posts.length).toBe(0);
    });

    test('[NEGATIVE] Should return empty array when not following anyone', async () => {
      // Create a new user who doesn't follow anyone
      const newUserReg = await request(app)
        .post('/api/register')
        .send({
          username: 'loneuser',
          password: 'password123',
        });

      const newUserLogin = await request(app)
        .post('/api/login')
        .send({
          username: 'loneuser',
          password: 'password123',
        });

      const response = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${newUserLogin.body.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('posts', []);
      expect(response.body).toHaveProperty('total', 0);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not following anyone');
    });

    test('[NEGATIVE] Should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/feed?page=1&limit=10')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Feed Pagination Tests', () => {
    beforeAll(async () => {
      // Create more posts for pagination testing
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${user2Token}`)
          .send({ content: `Pagination test post ${i + 1}` });
      }
    });

    test('[POSITIVE] Should paginate feed correctly', async () => {
      // Get first page
      const page1Response = await request(app)
        .get('/api/feed?page=1&limit=5')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(page1Response.body.page).toBe(1);
      expect(page1Response.body.limit).toBe(5);
      expect(page1Response.body.posts.length).toBeLessThanOrEqual(5);

      // Get second page
      const page2Response = await request(app)
        .get('/api/feed?page=2&limit=5')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(page2Response.body.page).toBe(2);
      expect(page2Response.body.posts.length).toBeGreaterThan(0);

      // Verify different posts on different pages
      const page1Ids = page1Response.body.posts.map(p => p.id);
      const page2Ids = page2Response.body.posts.map(p => p.id);
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection.length).toBe(0);
    });

    test('[POSITIVE] Should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/feed?page=1&limit=3')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.posts.length).toBeLessThanOrEqual(3);
    });

    test('[POSITIVE] Should calculate total pages correctly', async () => {
      const response = await request(app)
        .get('/api/feed?page=1&limit=5')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const expectedTotalPages = Math.ceil(response.body.total / 5);
      expect(response.body.totalPages).toBe(expectedTotalPages);
    });
  });

  describe('Feed Integration Tests', () => {
    test('[POSITIVE] Should update feed when following/unfollowing users', async () => {
      // Get initial feed
      const initialFeed = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const initialTotal = initialFeed.body.total;

      // Unfollow user2
      await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Get feed after unfollowing
      const afterUnfollowFeed = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Total should be less
      expect(afterUnfollowFeed.body.total).toBeLessThan(initialTotal);

      // Follow user2 again
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Get feed after following again
      const afterFollowFeed = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Total should increase again
      expect(afterFollowFeed.body.total).toBeGreaterThan(afterUnfollowFeed.body.total);
    });

    test('[POSITIVE] Should show new posts in feed immediately', async () => {
      const beforePost = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const beforeTotal = beforePost.body.total;

      // User2 creates a new post
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Brand new post for feed test' });

      const afterPost = await request(app)
        .get('/api/feed?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(afterPost.body.total).toBe(beforeTotal + 1);
    });
  });
});
