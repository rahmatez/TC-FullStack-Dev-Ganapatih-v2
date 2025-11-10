import request from 'supertest';
import app from '../src/server.js';
import prisma, { cleanDatabase, teardown } from './setup.js';

describe('TC-1: Authentication Tests (Register & Login)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  describe('Register Tests', () => {
    test('[POSITIVE] Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    test('[NEGATIVE] Should return 409 when username already exists', async () => {
      // Create first user
      await request(app)
        .post('/api/register')
        .send({
          username: 'duplicate',
          password: 'password123',
        })
        .expect(201);

      // Try to create user with same username
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'duplicate',
          password: 'password456',
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    test('[NEGATIVE] Should return 422 when username is too short', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'ab',
          password: 'password123',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details[0]).toHaveProperty('field', 'username');
    });

    test('[NEGATIVE] Should return 422 when password is too short', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: '12345',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details[0]).toHaveProperty('field', 'password');
    });

    test('[NEGATIVE] Should return 422 when username or password is missing', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('Login Tests', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/register')
        .send({
          username: 'loginuser',
          password: 'password123',
        });
    });

    test('[POSITIVE] Should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', 'loginuser');
    });

    test('[NEGATIVE] Should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    test('[NEGATIVE] Should return 401 with non-existent username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    test('[NEGATIVE] Should return 422 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'loginuser',
        })
        .expect(422);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('Token Refresh Tests', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and login to get refresh token
      await request(app)
        .post('/api/register')
        .send({
          username: 'refreshuser',
          password: 'password123',
        });

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'refreshuser',
          password: 'password123',
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    test('[POSITIVE] Should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    test('[NEGATIVE] Should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({
          refreshToken: 'invalid.token.here',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('[NEGATIVE] Should return 400 when refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Refresh token required');
    });
  });
});
