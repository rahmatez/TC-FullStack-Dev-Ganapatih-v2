# 📰 Simple News Feed System Ganapatih

A full-stack social media application similar to Twitter, built with **Next.js**, **Express**, and **PostgreSQL**.

[![Tests](https://img.shields.io/badge/tests-173%20passing-brightgreen)](#testing)
[![Backend Coverage](https://img.shields.io/badge/backend-80.39%25-brightgreen)](#testing)
[![Frontend Coverage](https://img.shields.io/badge/frontend-37.66%25-yellow)](#testing)

## ✨ Features

- 🔐 **User Authentication** - JWT-based auth with refresh tokens
- 📝 **Create Posts** - Share text posts (max 200 characters)
- 👥 **Follow System** - Follow/unfollow other users
- 📱 **Personalized Feed** - View posts from people you follow
- ⚡ **Real-time Updates** - Character counter and instant feedback
- 🎨 **Responsive UI** - Beautiful design with Tailwind CSS

## 🛠️ Tech Stack

**Backend:** Node.js • Express • PostgreSQL • JWT • bcrypt  
**Frontend:** Next.js 14 • TypeScript • Tailwind CSS • Axios  
**DevOps:** Docker • Docker Compose • GitHub Actions  
**Testing:** Jest • React Testing Library (173 tests, 100% passing)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih.git
cd TC-FullStack-Dev-Ganapatih
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**4. Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Using Docker (Recommended)

```bash
docker-compose up -d
```

## 🌐 Live Demo

> **Status:** Deployed to production

- **Frontend:** [https://tc-full-stack-dev-ganapatih.vercel.app](https://tc-full-stack-dev-ganapatih.vercel.app/)
- **Backend API:** [https://rahmatez-tc-fullstack-dev-ganapatih-production.up.railway.app/](https://rahmatez-tc-fullstack-dev-ganapatih-production.up.railway.app/api)

**Test Account:**
- Username: `demo`
- Password: `password123`

📖 **Deployment Guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

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
```

**Login**
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": 1, "username": "john_doe" }
}
```

**Create Post**
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello world!"
}
```

**Get Feed**
```http
GET /api/feed?page=1&limit=10
Authorization: Bearer {token}
```

### Posts

**Get Post by ID**
```http
GET /api/posts/{postId}
Authorization: Bearer {token}

Response:
{
  "id": 42,
  "userId": 3,
  "username": "alice",
  "content": "Hello world!",
  "createdAt": "2025-09-12T10:00:00.000Z"
}
```

**Get My Posts**
```http
GET /api/posts/user/me?page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "page": 1,
  "posts": [
    {
      "id": 9,
      "userId": 1,
      "username": "demo",
      "content": "Sample content",
      "createdAt": "2025-09-12T08:30:00.000Z"
    }
  ]
}
```

### Users

**List Users**
```http
GET /api/users
Authorization: Bearer {token}

Response:
[
  {
    "id": 2,
    "username": "alice",
    "createdAt": "2025-09-10T12:00:00.000Z",
    "isFollowing": true
  }
]
```

**Get Current User**
```http
GET /api/users/me
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "username": "demo",
  "created_at": "2025-09-09T11:00:00.000Z"
}
```

**Get User Posts**
```http
GET /api/users/{userId}/posts?page=1&limit=10
Authorization: Bearer {token}

Response:
[
  {
    "id": 17,
    "user_id": 2,
    "username": "alice",
    "content": "Another update",
    "created_at": "2025-09-12T09:45:00.000Z"
  }
]
```

### Follow System

**Follow User**
```http
POST /api/follow/{userId}
Authorization: Bearer {token}

Response:
{
  "message": "You are now following user 2"
}
```

**Unfollow User**
```http
DELETE /api/follow/{userId}
Authorization: Bearer {token}

Response:
{
  "message": "You unfollowed user 2"
}
```

**Check Follow Status**
```http
GET /api/follow/check/{userId}
Authorization: Bearer {token}

Response:
{
  "isFollowing": true
}
```

**List Followers**
```http
GET /api/follow/followers/{userId}
Authorization: Bearer {token}

Response:
{
  "count": 2,
  "followers": [
    { "id": 5, "username": "bob", "followed_at": "2025-09-12T08:00:00.000Z" }
  ]
}
```

**List Following**
```http
GET /api/follow/following/{userId}
Authorization: Bearer {token}

Response:
{
  "count": 1,
  "following": [
    { "id": 2, "username": "alice", "followed_at": "2025-09-12T08:00:00.000Z" }
  ]
}
```

### Utilities

**Health Check**
```http
GET /health

Response:
{
  "status": "OK",
  "message": "News Feed API is running",
  "timestamp": "2025-09-12T10:00:00.000Z"
}
```

</details>

## 📁 Project Structure

```
newsfeed-system/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth, validation, error handling
│   │   └── database/     # DB connection & migrations
│   └── tests/            # Jest tests (119 tests)
├── frontend/             # Next.js + TypeScript UI
│   ├── src/
│   │   ├── pages/        # Next.js pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── lib/          # Utilities
│   └── tests/            # Jest tests (54 tests)
├── docker-compose.yml    # Docker orchestration
└── .github/workflows/    # CI/CD pipelines
```

## 🗄️ Database Schema

**Users**
- `id` (PK)
- `username` (unique)
- `password_hash`
- `created_at`

**Posts**
- `id` (PK)
- `user_id` (FK)
- `content` (max 200 chars)
- `created_at`

**Follows**
- `follower_id` (FK)
- `followee_id` (FK)
- `created_at`
- PK: (follower_id, followee_id)

**Indexes:** Optimized for feed queries with indexes on `user_id`, `created_at`, and composite keys.

## 🧪 Testing

**Run all tests:**
```bash
# Backend (119 tests, 80.39% coverage)
cd backend && npm test

# Frontend (54 tests, 37.66% coverage)
cd frontend && npm test
```

**Test breakdown:**
- ✅ API Tests (48) - Complete endpoint testing
- ✅ Unit Tests (42) - Model layer testing  
- ✅ Integration Tests (29) - End-to-end flows
- ✅ Component Tests (21) - UI testing
- ✅ Context Tests (10) - State management

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication + refresh tokens
- ✅ Input validation & sanitization
- ✅ Rate limiting (100 req/15min)
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)

## 📸 Screenshots

<table>
  <tr>
    <td><img src="documentation/image1.png" alt="Login" width="300"/><br/><b>Login Page</b></td>
    <td><img src="documentation/image2.png" alt="Feed" width="300"/><br/><b>News Feed</b></td>
    <td><img src="documentation/image3.png" alt="Profile" width="300"/><br/><b>User Profile</b></td>
  </tr>
</table>

## 🚢 Deployment

### Backend (Railway / Render / Heroku)

**Environment Variables:**
```env
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=newsfeed_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
```

**Commands:**
```bash
npm install
npm run migrate
npm start
```

### Frontend (Vercel / Netlify)

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

**Commands:**
```bash
npm install
npm run build
npm start
```

## 📚 Documentation

- 📖 [API Documentation](documentation/API_DOCUMENTATION.md)
- 🔧 [Setup Guide](documentation/SETUP_GUIDE.md)
- 📋 [Database Design](documentation/DATABASE_DESIGN.md)
- 🧪 [Testing Guide](backend/TESTING.md)
- 🚀 [Deployment Guide](documentation/DEPLOYMENT.md)

## 🎯 Features Checklist

### Core Requirements ✅
- [x] User registration & login
- [x] JWT authentication
- [x] Create posts (max 200 chars)
- [x] Follow/unfollow users
- [x] Personalized feed
- [x] Pagination support
- [x] PostgreSQL database
- [x] Input validation
- [x] Error handling

### Bonus Features ✅
- [x] JWT refresh tokens
- [x] Docker & Docker Compose
- [x] GitHub Actions CI/CD
- [x] Database optimization (indexes)
- [x] Real-time character counter
- [x] Relative timestamps ("2 hours ago")
- [x] Rate limiting
- [x] Comprehensive testing (173 tests)
- [x] Security headers
- [x] Responsive design

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

## 🙏 Acknowledgments

- Inspired by Twitter and Instagram's news feed systems
- Built with modern best practices and industry standards
- Special thanks to the open-source community

---

<div align="center">

**⭐ If you like this project, please give it a star! ⭐**

Made with for PT Ganapatih Technical Challenge

[Report Bug](https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih/issues) • [Request Feature](https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih/issues)

</div>
