# News Feed Frontend

Frontend aplikasi News Feed yang dibangun dengan Next.js, React, TypeScript, dan Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Validation**: Zod

## Prerequisites

- Node.js 18 atau lebih tinggi
- npm atau yarn

## Setup Lokal

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Copy file `.env.local.example` menjadi `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 4. Build untuk Production

```bash
npm run build
npm start
```

## Fitur

### Autentikasi
- ✅ Register dengan username dan password
- ✅ Login dengan validasi
- ✅ Auto refresh token
- ✅ Protected routes
- ✅ Logout

### Posts
- ✅ Buat post (max 200 karakter)
- ✅ Character counter real-time
- ✅ Delete post sendiri
- ✅ View posts dengan timestamp relatif

### Follow System
- ✅ Follow/unfollow users
- ✅ List followers dan following
- ✅ Follow suggestions
- ✅ Tidak bisa follow diri sendiri

### Feed
- ✅ Lihat posts dari users yang difollow
- ✅ Pagination/Load more
- ✅ Real-time character count
- ✅ Empty state messages

### Profile
- ✅ View own profile
- ✅ Posts count, followers, following
- ✅ List posts sendiri
- ✅ Profile statistics

### People/Discovery
- ✅ Search users
- ✅ View all users
- ✅ Quick follow/unfollow
- ✅ User statistics

## Struktur Folder

```
src/
├── components/          # Reusable components
│   ├── Navbar.tsx      # Navigation bar
│   ├── CreatePost.tsx  # Post creation form
│   ├── PostCard.tsx    # Post display card
│   ├── FollowSuggestions.tsx
│   └── withAuth.tsx    # HOC for authentication
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utilities
│   └── api.ts         # API client with Axios
├── pages/             # Next.js pages
│   ├── _app.tsx       # App wrapper
│   ├── _document.tsx  # Document wrapper
│   ├── index.tsx      # Landing page
│   ├── login.tsx      # Login page
│   ├── register.tsx   # Register page
│   ├── feed.tsx       # Feed page (protected)
│   ├── profile.tsx    # Profile page (protected)
│   └── people.tsx     # People discovery (protected)
└── styles/
    └── globals.css    # Global styles with Tailwind
```

## API Integration

Aplikasi terhubung ke backend API dengan endpoint berikut:

### Auth
- `POST /api/register` - Register user baru
- `POST /api/login` - Login user
- `POST /api/refresh` - Refresh access token

### Posts
- `POST /api/posts` - Buat post baru
- `GET /api/posts/my-posts` - Get posts sendiri
- `GET /api/posts/user/:username` - Get posts user lain
- `DELETE /api/posts/:id` - Delete post

### Follow
- `POST /api/follow/:userId` - Follow user
- `DELETE /api/follow/:userId` - Unfollow user
- `GET /api/follow/:userId/followers` - Get followers
- `GET /api/follow/:userId/following` - Get following
- `GET /api/follow/check/:userId` - Check follow status

### Feed
- `GET /api/feed` - Get feed posts

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/me/profile` - Get current user profile

## Authentication Flow

1. User login/register
2. Receive JWT access token dan refresh token
3. Access token disimpan di localStorage
4. Setiap request otomatis include token di header
5. Jika token expired, auto refresh dengan refresh token
6. Jika refresh gagal, redirect ke login

## Styling

Menggunakan Tailwind CSS dengan custom theme:

- Primary color: Blue (600-700)
- Custom button classes: `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-danger`
- Custom input class: `input`
- Custom card class: `card`

## Testing

```bash
npm test
```

## Deployment ke Vercel

### Via GitHub (Recommended)

1. Push code ke GitHub repository
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = URL backend API Anda
4. Deploy!

### Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Ikuti instruksi untuk set environment variables.

## Environment Variables untuk Production

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app/api
```

**Catatan**: Pastikan backend API sudah di-deploy dan CORS sudah dikonfigurasi untuk menerima request dari domain frontend Anda.

## Features Checklist

- ✅ Responsive design (mobile & desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Character counter untuk posts
- ✅ Pagination
- ✅ Protected routes
- ✅ Auto token refresh
- ✅ Relative timestamps
- ✅ Search functionality
- ✅ Empty states
- ✅ Follow/unfollow tanpa reload
- ✅ Real-time UI updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
