import request from 'supertest';
import app from '../src/server.js';
import { cleanDatabase, teardown } from './setup.js';

describe('Integration Tests - Full User Flow', () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  test('Complete user journey: register, login, post, follow, view feed', async () => {
    // 1. Register two users
    const user1Response = await request(app)
      .post('/api/register')
      .send({
        username: 'alice',
        password: 'password123',
      })
      .expect(201);

    expect(user1Response.body.user).toHaveProperty('id');
    const aliceId = user1Response.body.user.id;

    const user2Response = await request(app)
      .post('/api/register')
      .send({
        username: 'bob',
        password: 'password123',
      })
      .expect(201);

    const bobId = user2Response.body.user.id;

    // 2. Login both users
    const aliceLogin = await request(app)
      .post('/api/login')
      .send({
        username: 'alice',
        password: 'password123',
      })
      .expect(200);

    const aliceToken = aliceLogin.body.token;

    const bobLogin = await request(app)
      .post('/api/login')
      .send({
        username: 'bob',
        password: 'password123',
      })
      .expect(200);

    const bobToken = bobLogin.body.token;

    // 3. Bob creates posts
    const bobPost1 = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ content: 'Hello from Bob!' })
      .expect(201);

    expect(bobPost1.body).toHaveProperty('id');

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ content: 'Another post from Bob!' })
      .expect(201);

    // 4. Alice tries to view feed (should be empty as she follows no one)
    const emptyFeed = await request(app)
      .get('/api/feed?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(emptyFeed.body.posts).toHaveLength(0);
    expect(emptyFeed.body.message).toContain('not following anyone');

    // 5. Alice follows Bob
    await request(app)
      .post(`/api/follow/${bobId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    // 6. Alice views feed again (should see Bob's posts)
    const feedWithPosts = await request(app)
      .get('/api/feed?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(feedWithPosts.body.posts.length).toBeGreaterThan(0);
    expect(feedWithPosts.body.posts[0]).toHaveProperty('username', 'bob');

    // 7. Verify posts are sorted by newest first
    const posts = feedWithPosts.body.posts;
    for (let i = 0; i < posts.length - 1; i++) {
      const current = new Date(posts[i].createdAt);
      const next = new Date(posts[i + 1].createdAt);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }

    // 8. Alice creates her own post
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ content: 'Hi Bob, nice to meet you!' })
      .expect(201);

    // 9. Get Alice's posts
    const alicePosts = await request(app)
      .get('/api/posts/my-posts?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(alicePosts.body.posts.length).toBe(1);
    expect(alicePosts.body.posts[0].content).toBe('Hi Bob, nice to meet you!');

    // 10. Bob follows Alice back
    await request(app)
      .post(`/api/follow/${aliceId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(200);

    // 11. Bob views his feed (should see Alice's post)
    const bobFeed = await request(app)
      .get('/api/feed?page=1&limit=10')
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(200);

    const alicePostInBobFeed = bobFeed.body.posts.find(p => p.username === 'alice');
    expect(alicePostInBobFeed).toBeDefined();

    // 12. Get followers/following stats
    const aliceFollowers = await request(app)
      .get(`/api/follow/${aliceId}/followers`)
      .expect(200);

    expect(aliceFollowers.body.total).toBe(1);

    const aliceFollowing = await request(app)
      .get(`/api/follow/${aliceId}/following`)
      .expect(200);

    expect(aliceFollowing.body.total).toBe(1);

    // 13. Alice unfollows Bob
    await request(app)
      .delete(`/api/follow/${bobId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    // 14. Alice's feed should be empty again
    const emptyFeedAgain = await request(app)
      .get('/api/feed?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(emptyFeedAgain.body.posts).toHaveLength(0);

    // 15. Alice deletes her post
    const alicePostId = alicePosts.body.posts[0].id;
    await request(app)
      .delete(`/api/posts/${alicePostId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    // 16. Verify post is deleted
    const alicePostsAfterDelete = await request(app)
      .get('/api/posts/my-posts?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(alicePostsAfterDelete.body.posts).toHaveLength(0);
  });

  test('Error handling flow: invalid operations', async () => {
    // Register user
    await request(app)
      .post('/api/register')
      .send({
        username: 'errortest',
        password: 'password123',
      })
      .expect(201);

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'errortest',
        password: 'password123',
      })
      .expect(200);

    const token = loginResponse.body.token;
    const userId = loginResponse.body.user.id;

    // Try to create post with content > 200 chars
    const longContent = 'a'.repeat(201);
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: longContent })
      .expect(422);

    // Try to follow non-existent user
    await request(app)
      .post('/api/follow/99999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    // Try to follow self
    await request(app)
      .post(`/api/follow/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    // Try to delete non-existent post
    await request(app)
      .delete('/api/posts/99999')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    // Try to access protected route without token
    await request(app)
      .post('/api/posts')
      .send({ content: 'This should fail' })
      .expect(401);
  });
});
