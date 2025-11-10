# News Feed Backend API

Backend API untuk sistem news feed sederhana yang dibangun dengan Node.js, Express, Prisma, dan PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, express-rate-limit

## Prerequisites

- Node.js 18 atau lebih tinggi
- PostgreSQL 14 atau lebih tinggi
- npm atau yarn

## Setup Lokal

### 1. Clone dan Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Buat database PostgreSQL:

```bash
createdb newsfeed_db
```

### 3. Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/newsfeed_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 4. Migrasi Database

Jalankan migrasi untuk membuat tabel:

```bash
npm run migrate
```

### 5. Seed Database (Opsional)

Isi database dengan data contoh:

```bash
npm run seed
```

Data seed mencakup:
- 4 user (alice, bob, charlie, diana) dengan password: `password123`
- Beberapa post dari setiap user
- Relasi follow antar user

### 6. Jalankan Server

Development mode dengan auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Refresh Token
```http
POST /api/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Posts

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello world!"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "userId": 1,
  "username": "john_doe",
  "content": "Hello world!",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### Get My Posts
```http
GET /api/posts/my-posts?page=1&limit=10
Authorization: Bearer <token>
```

#### Get User Posts by Username
```http
GET /api/posts/user/:username?page=1&limit=10
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Follow

#### Follow User
```http
POST /api/follow/:userId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "message": "You are now following alice"
}
```

#### Unfollow User
```http
DELETE /api/follow/:userId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "message": "You unfollowed alice"
}
```

#### Get Followers
```http
GET /api/follow/:userId/followers?page=1&limit=10
```

#### Get Following
```http
GET /api/follow/:userId/following?page=1&limit=10
```

#### Check Follow Status
```http
GET /api/follow/check/:userId
Authorization: Bearer <token>
```

### Feed

#### Get Feed
```http
GET /api/feed?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "posts": [
    {
      "id": 15,
      "userId": 2,
      "username": "alice",
      "content": "Great day!",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

### Users

#### Get All Users
```http
GET /api/users?page=1&limit=10&search=john
```

#### Get User Profile
```http
GET /api/users/:username
```

#### Get Current User Profile
```http
GET /api/users/me/profile
Authorization: Bearer <token>
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Username already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "content",
      "message": "Content must not exceed 200 characters"
    }
  ]
}
```

## Database Schema

### Users Table
- `id` (PK, auto-increment)
- `username` (unique)
- `password_hash`
- `created_at`
- `updated_at`

### Posts Table
- `id` (PK, auto-increment)
- `user_id` (FK → users.id)
- `content` (max 200 chars)
- `created_at`
- `updated_at`

### Follows Table
- `follower_id` (FK → users.id)
- `followee_id` (FK → users.id)
- `created_at`
- Composite PK: (follower_id, followee_id)

## Testing

```bash
npm test
```

## Deployment

### Railway

1. Push ke GitHub repository
2. Connect repository ke Railway
3. Set environment variables di Railway dashboard
4. Deploy akan otomatis berjalan

Environment variables yang diperlukan:
- `DATABASE_URL` (PostgreSQL connection string dari Railway)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `NODE_ENV=production`

### Docker

Build image:
```bash
docker build -t newsfeed-backend .
```

Run container:
```bash
docker run -p 5000:5000 --env-file .env newsfeed-backend
```

## Security Features

- ✅ Helmet.js untuk security headers
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ Password hashing dengan bcrypt
- ✅ JWT authentication
- ✅ Input validation dengan Zod
- ✅ SQL injection protection (Prisma ORM)

## License

MIT
