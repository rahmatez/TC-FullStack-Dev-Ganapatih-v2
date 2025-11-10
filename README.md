<div align="center">

# 🚀 Simple News Feed System

![Tests](https://img.shields.io/badge/tests-103%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/coverage-90.36%25-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/coverage-35.58%25-yellow)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**A modern, full-stack social media platform with real-time feeds, user following, and JWT authentication**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-endpoints) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## ✨ Features

🔐 **Authentication & Security**
- JWT-based authentication with refresh token mechanism
- Secure password hashing with bcrypt
- Rate limiting (100 req/15min)
- Security headers via Helmet.js
- Input validation with Zod

📝 **Posts Management**
- Create posts up to 200 characters
- Real-time character counter
- View user posts with pagination
- Relative timestamps ("2h ago", "5m ago")

👥 **Social Features**
- Follow/unfollow users
- View followers and following lists
- Follow suggestions
- Personalized news feed from followed users

🎨 **User Experience**
- Responsive design (mobile & desktop)
- Toast notifications
- Loading states
- Empty state handling
- Form validation with feedback

## 🛠️ Tech Stack

### Backend
**Node.js 18+ • Express.js 4.18.2 • PostgreSQL 14+ • Prisma ORM 5.7.0 • JWT • Zod**

### Frontend
**Next.js 14.0.4 • React 18 • TypeScript • Tailwind CSS • Axios**

### DevOps
**Docker • Docker Compose • GitHub Actions • Railway • Vercel**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Option 1: Using Docker (Recommended)

**1. Clone repository**
```bash
git clone https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih-v2.git
cd TC-FullStack-DEV-new
```

**2. Start with Docker Compose**
```bash
docker-compose up -d
```

**3. Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:5432

### Option 2: Manual Setup

**1. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma migrate deploy
npm run seed  # Optional: Load test data
npm run dev
```

**2. Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with API URL
npm run dev
```

**3. Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🌐 Live Demo

> **Status:** Ready for deployment
> 
> **Note:** Deployment URLs will be added after deployment to production

**Test Accounts (after running seed):**
- Username: `alice` / Password: `password123`
- Username: `bob` / Password: `password123`
- Username: `charlie` / Password: `password123`
- Username: `diana` / Password: `password123`

📖 **Deployment Guide:** See [readme/DEPLOYMENT.md](readme/DEPLOYMENT.md) for detailed instructions.

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login user |
| POST | `/api/refresh` | Refresh JWT token |
| GET | `/health` | Health check |
| POST | `/api/posts` | Create post (auth required) |
| GET | `/api/posts/:postId` | Get post by ID |
| GET | `/api/posts/user/me` | Get authenticated user posts |
| GET | `/api/users` | List users with follow status |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/:userId` | Get user profile by ID |
| GET | `/api/users/:userId/posts` | Get posts by user ID |
| GET | `/api/feed` | Get personalized feed |
| POST | `/api/follow/:userId` | Follow user |
| DELETE | `/api/follow/:userId` | Unfollow user |
| GET | `/api/follow/check/:userId` | Check follow relationship |
| GET | `/api/follow/followers/:userId` | List followers with count |
| GET | `/api/follow/following/:userId` | List following with count |

<details>
<summary><b>View detailed API documentation</b></summary>

### Authentication

**Register**
```http
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

**Login**
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

**Refresh Token**
```http
POST /api/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Posts

**Create Post**
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello world! This is my first post."
}

Response: 201 Created
{
  "id": 42,
  "userId": 1,
  "content": "Hello world! This is my first post.",
  "createdAt": "2025-01-12T10:00:00.000Z"
}
```

**Get Post by ID**
```http
GET /api/posts/{postId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 42,
  "userId": 3,
  "username": "alice",
  "content": "Hello world!",
  "createdAt": "2025-01-12T10:00:00.000Z"
}
```

**Get My Posts**
```http
GET /api/posts/user/me?page=1&limit=10
Authorization: Bearer {token}

Response: 200 OK
{
  "page": 1,
  "posts": [
    {
      "id": 9,
      "userId": 1,
      "username": "john_doe",
      "content": "Sample content",
      "createdAt": "2025-01-12T08:30:00.000Z"
    }
  ]
}
```

**Get User Posts**
```http
GET /api/users/{userId}/posts?page=1&limit=10
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 17,
    "userId": 2,
    "username": "alice",
    "content": "Another update",
    "createdAt": "2025-01-12T09:45:00.000Z"
  }
]
```

### Users

**List Users**
```http
GET /api/users
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": 2,
    "username": "alice",
    "createdAt": "2025-01-10T12:00:00.000Z",
    "isFollowing": true
  },
  {
    "id": 3,
    "username": "bob",
    "createdAt": "2025-01-10T13:00:00.000Z",
    "isFollowing": false
  }
]
```

**Get Current User**
```http
GET /api/users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 1,
  "username": "john_doe",
  "createdAt": "2025-01-09T11:00:00.000Z"
}
```

**Get User Profile**
```http
GET /api/users/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": 2,
  "username": "alice",
  "createdAt": "2025-01-10T12:00:00.000Z"
}
```

### Feed

**Get Feed**
```http
GET /api/feed?page=1&limit=10
Authorization: Bearer {token}

Response: 200 OK
{
  "page": 1,
  "posts": [
    {
      "id": 25,
      "userId": 3,
      "username": "bob",
      "content": "Latest update from followed user",
      "createdAt": "2025-01-12T11:00:00.000Z"
    }
  ]
}
```

### Follow System

**Follow User**
```http
POST /api/follow/{userId}
Authorization: Bearer {token}

Response: 201 Created
{
  "message": "You are now following user 2"
}
```

**Unfollow User**
```http
DELETE /api/follow/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "You unfollowed user 2"
}
```

**Check Follow Status**
```http
GET /api/follow/check/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "isFollowing": true
}
```

**List Followers**
```http
GET /api/follow/followers/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "count": 2,
  "followers": [
    {
      "id": 5,
      "username": "bob",
      "followedAt": "2025-01-12T08:00:00.000Z"
    }
  ]
}
```

**List Following**
```http
GET /api/follow/following/{userId}
Authorization: Bearer {token}

Response: 200 OK
{
  "count": 1,
  "following": [
    {
      "id": 2,
      "username": "alice",
      "followedAt": "2025-01-12T08:00:00.000Z"
    }
  ]
}
```

### Utilities

**Health Check**
```http
GET /health

Response: 200 OK
{
  "status": "OK",
  "message": "News Feed API is running",
  "timestamp": "2025-01-12T10:00:00.000Z"
}
```

</details>

## 📁 Project Structure

```
TC-FullStack-DEV-new/
├── backend/              # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   ├── seed.js       # Test data seeder
│   │   └── migrations/   # Database migrations
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation, error handling
│   │   └── validators/   # Zod schemas
│   ├── __tests__/        # Jest tests (86 tests)
│   ├── Dockerfile
│   └── railway.json      # Railway deployment config
├── frontend/             # Next.js + TypeScript UI
│   ├── src/
│   │   ├── pages/        # Next.js pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # Auth context
│   │   ├── lib/          # API utilities
│   │   └── styles/       # Tailwind CSS
│   ├── __tests__/        # Jest tests (17 tests)
│   └── Dockerfile
├── readme/               # Documentation
│   ├── API_TESTING.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_SUMMARY.md
│   ├── SETUP_GUIDE.md
│   └── SUBMISSION_CHECKLIST.md
├── docker-compose.yml    # Docker orchestration
├── .github/workflows/    # CI/CD pipelines
└── implementation.md     # Requirements specification
```

## 🗄️ Database Schema

The system uses **Prisma ORM** with the following schema:

**Users**
- `id` (Int, PK, auto-increment)
- `username` (String, unique, indexed)
- `password` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Posts**
- `id` (Int, PK, auto-increment)
- `userId` (Int, FK → users.id)
- `content` (String, max 200 chars)
- `createdAt` (DateTime, indexed)
- `updatedAt` (DateTime)

**Follows**
- `followerId` (Int, FK → users.id)
- `followeeId` (Int, FK → users.id)
- `createdAt` (DateTime)
- PK: (followerId, followeeId)
- Indexes on both foreign keys

**Optimizations:**
- Composite indexes for feed queries
- Cascade delete for referential integrity
- Foreign key constraints
- Unique constraints on username and follow relationships

## 🧪 Testing

**Run all tests:**
```bash
# Backend (86 tests, 90.36% coverage)
cd backend && npm test

# Frontend (17 tests, 35.58% coverage)
cd frontend && npm test

# Coverage reports
npm run test:coverage
```

**Test breakdown:**
- ✅ **Backend Tests (86)**
  - Authentication tests (registration, login, refresh tokens)
  - Posts CRUD operations
  - Follow/unfollow functionality
  - Feed generation with pagination
  - User profile and listing
  - Error handling and validation
  - Integration tests (end-to-end flows)

- ✅ **Frontend Tests (17)**
  - Component tests (CreatePost, FollowSuggestions, PostCard, Navbar, Toast)
  - Page tests (Login, Register, Feed)
  - Authentication context tests
  - Form validation tests
  - API integration tests

**CI/CD:**
- GitHub Actions workflow runs all tests on push/PR
- PostgreSQL service container for integration tests
- Automated test reports

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT authentication with refresh tokens (15min access, 7d refresh)
- ✅ Input validation & sanitization (Zod schemas)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM with parameterized queries)
- ✅ XSS protection
- ✅ Authentication middleware on protected routes
- ✅ Environment variable management

## 🚢 Deployment

### Backend (Railway / Render / Heroku)

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

**Deploy Steps:**
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add PostgreSQL addon (automatic DATABASE_URL)
4. Set environment variables
5. Deploy with: `npm install && npx prisma migrate deploy && npm start`

### Frontend (Vercel / Netlify)

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

**Deploy Steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable
4. Deploy with: `npm install && npm run build && npm start`

📖 **Full Guide:** [readme/DEPLOYMENT.md](readme/DEPLOYMENT.md)

## 📚 Documentation

- 📖 [API Testing Guide](readme/API_TESTING.md)
- 🔧 [Setup Guide](readme/SETUP_GUIDE.md)
- 📋 [Project Summary](readme/PROJECT_SUMMARY.md)
- 🧪 [Backend Test Documentation](backend/TEST_DOCUMENTATION.md)
- ✅ [Submission Checklist](readme/SUBMISSION_CHECKLIST.md)
- 📝 [Implementation Specification](implementation.md)

## 🎯 Features Checklist

### Core Requirements ✅
- [x] User registration & login
- [x] JWT authentication with refresh tokens
- [x] Create posts (max 200 characters)
- [x] Follow/unfollow users
- [x] Personalized feed from followed users
- [x] Pagination support
- [x] PostgreSQL database with Prisma ORM
- [x] Input validation (Zod schemas)
- [x] Error handling middleware
- [x] Comprehensive testing (103 tests total)

### Bonus Features ✅
- [x] JWT refresh token mechanism
- [x] Docker & Docker Compose
- [x] GitHub Actions CI/CD
- [x] Database optimization (indexes)
- [x] Real-time character counter
- [x] Relative timestamps ("2 hours ago")
- [x] Rate limiting (100 req/15min)
- [x] Security headers (Helmet.js)
- [x] Responsive design
- [x] Follow suggestions
- [x] User search functionality
- [x] Toast notifications
- [x] Loading states
- [x] Empty state handling

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL service
sudo service postgresql status

# Restart if needed
sudo service postgresql restart
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Prisma Migration Issues
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# View logs
docker-compose logs -f
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built as a technical challenge for **PT Ganapatih**

- **GitHub:** [@rahmatez](https://github.com/rahmatez)
- **Email:** rahmatezdev@gmail.com
- **Repository:** [TC-FullStack-Dev-Ganapatih-v2](https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih-v2)

## 🙏 Acknowledgments

- Inspired by modern social media platforms (Twitter, Instagram)
- Built with industry best practices and clean architecture
- Special thanks to:
  - Express.js and Node.js community
  - Next.js and Vercel team
  - Prisma ORM team
  - Tailwind CSS
  - All open-source contributors

---

<div align="center">

**⭐ If you like this project, please give it a star! ⭐**

Built with ❤️ for PT Ganapatih Technical Assessment

</div>
