# Simple News Feed System

Sistem news feed sederhana yang memungkinkan pengguna untuk membuat akun, posting teks, follow/unfollow pengguna lain, dan melihat feed dari pengguna yang diikuti.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Security**: Helmet, express-rate-limit, bcryptjs

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

### DevOps
- **Containerization**: Docker & Docker Compose
- **Backend Deployment**: Railway
- **Frontend Deployment**: Vercel
- **Version Control**: Git & GitHub

## 📋 Fitur Lengkap

### ✅ User Management
- Register dengan username dan password
- Login dengan JWT authentication
- Auto refresh token mechanism
- Secure password hashing dengan bcrypt
- Input validation

### ✅ Posts
- Buat post dengan maksimal 200 karakter
- Real-time character counter
- Delete post sendiri
- View posts dengan relative timestamps
- Pagination support

### ✅ Follow System
- Follow dan unfollow users
- View followers list
- View following list
- Follow suggestions
- Tidak bisa follow diri sendiri
- Real-time update tanpa reload

### ✅ News Feed
- View posts dari users yang difollow
- Sorted by newest first
- Pagination dengan "Load More"
- Empty state handling

### ✅ Profile & Discovery
- User profile dengan statistics
- Search users
- View all users
- User posts list

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm atau yarn
- Git

### Quick Start dengan Docker (Recommended)

1. **Clone repository**
```bash
git clone <repository-url>
cd new_tech
```

2. **Jalankan dengan Docker Compose**
```bash
docker-compose up -d
```

3. **Akses aplikasi**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

### Manual Setup

#### Backend Setup

1. **Navigate ke folder backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. **Setup database**
```bash
# Buat database
createdb newsfeed_db

# Jalankan migrasi
npm run migrate

# (Optional) Seed data
npm run seed
```

5. **Jalankan server**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

#### Frontend Setup

1. **Navigate ke folder frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local
```

4. **Jalankan development server**
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### Users Table
```sql
- id (PK, auto-increment)
- username (unique)
- password_hash
- created_at
- updated_at
```

### Posts Table
```sql
- id (PK, auto-increment)
- user_id (FK → users.id)
- content (max 200 chars)
- created_at
- updated_at
```

### Follows Table
```sql
- follower_id (FK → users.id)
- followee_id (FK → users.id)
- created_at
- PK: (follower_id, followee_id)
```

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - Register user baru
- `POST /api/login` - Login user
- `POST /api/refresh` - Refresh access token

### Posts
- `POST /api/posts` - Buat post (auth required)
- `GET /api/posts/my-posts` - Get posts sendiri (auth required)
- `GET /api/posts/user/:username` - Get posts user
- `DELETE /api/posts/:id` - Delete post (auth required)

### Follow
- `POST /api/follow/:userId` - Follow user (auth required)
- `DELETE /api/follow/:userId` - Unfollow user (auth required)
- `GET /api/follow/:userId/followers` - Get followers
- `GET /api/follow/:userId/following` - Get following
- `GET /api/follow/check/:userId` - Check follow status (auth required)

### Feed
- `GET /api/feed?page=1&limit=10` - Get feed (auth required)

### Users
- `GET /api/users?search=&page=1&limit=10` - Get all users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/me/profile` - Get current user (auth required)

Dokumentasi lengkap API: [backend/README.md](backend/README.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend - Railway

1. Push code ke GitHub
2. Connect repository ke Railway
3. Set environment variables:
   - `DATABASE_URL` (provided by Railway)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`
4. Deploy!

### Frontend - Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`
4. Deploy!

Panduan lengkap: 
- [Backend Deployment](backend/README.md#deployment)
- [Frontend Deployment](frontend/README.md#deployment-ke-vercel)

## 🔒 Security Features

- ✅ Password hashing dengan bcrypt (10 rounds)
- ✅ JWT authentication dengan refresh tokens
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js untuk security headers
- ✅ CORS configuration
- ✅ Input validation dengan Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection

## 📁 Project Structure

```
new_tech/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml
├── implementation.md
└── README.md
```

## 🎯 Test Cases

### TC-1: Registrasi & Login
- ✅ User baru berhasil register
- ✅ Username duplikat → 409 Conflict
- ✅ Login dengan credentials valid
- ✅ Login dengan credentials invalid → 401

### TC-2: Membuat Post
- ✅ Post dengan ≤ 200 karakter berhasil
- ✅ Post dengan > 200 karakter → 422
- ✅ Post tanpa authentication → 401

### TC-3: Follow / Unfollow
- ✅ Follow user valid berhasil
- ✅ Follow user yang tidak ada → 404
- ✅ Unfollow user yang di-follow
- ✅ Follow diri sendiri → 400

### TC-4: Feed
- ✅ Feed menampilkan posts dari users yang difollow
- ✅ Feed sorted by newest
- ✅ Pagination berfungsi
- ✅ Feed kosong jika tidak follow siapa pun

## 🎨 UI/UX Features

- ✅ Responsive design (mobile & desktop)
- ✅ Loading states
- ✅ Error handling & messages
- ✅ Form validation with feedback
- ✅ Character counter (0-200)
- ✅ Relative timestamps ("5m ago", "2h ago")
- ✅ Empty states
- ✅ Smooth animations
- ✅ Toast notifications

## 🌟 Bonus Features Implemented

- ✅ JWT dengan refresh token mechanism
- ✅ Docker & Docker Compose support
- ✅ Rate limiting
- ✅ Optimized database queries dengan indexes
- ✅ Infinite scroll preparation (load more)
- ✅ Search functionality
- ✅ Real-time character counter
- ✅ Follow suggestions

## 📝 Test Accounts (from seed)

Setelah running seed:

| Username | Password |
|----------|----------|
| alice    | password123 |
| bob      | password123 |
| charlie  | password123 |
| diana    | password123 |

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
```

## 📖 Documentation

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Implementation Guide](implementation.md)
- [API Documentation](backend/README.md#api-endpoints)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Author

Dibuat untuk memenuhi tes Pengembang Full-Stack Ganapatih

## 🙏 Acknowledgments

- Express.js community
- Next.js team
- Prisma team
- Tailwind CSS
- All open source contributors

---

**Deadline**: 11 November 2025  
**Contact**: career@ganapatih.com

Happy Coding! 🚀
