# Tick Always - Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tick-always
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tick-always

# JWT Secret (generate a random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-in-production

# Application URL
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Important**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate a secure random string for `JWT_SECRET` and `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)

### 3. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/tick-always`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from Atlas dashboard
4. Update `MONGODB_URI` in `.env.local`

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Create Your First Account

1. Navigate to `/register`
2. Create an account with your email and password
3. You'll be automatically logged in and redirected to the tasks page

## Project Structure

```
tick-always/
├── app/
│   ├── (auth)/          # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── tasks/
│   │   ├── calendar/
│   │   └── habits/
│   ├── api/             # API routes
│   │   └── auth/
│   └── page.tsx         # Home page (redirects to /tasks)
├── components/
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── mongodb.ts       # MongoDB connection
│   ├── auth.ts          # Authentication utilities
│   ├── models/          # Mongoose models
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

## Available Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)
- `/tasks` - Task management page
- `/calendar` - Calendar view
- `/habits` - Habit tracking page

### API Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

## Next Steps

The foundation is now set up! You can start building:

1. **Task Management** - Implement task CRUD operations
2. **Recurring Tasks** - Add recurrence logic
3. **Calendar View** - Build calendar components
4. **Habit Tracking** - Implement habit features

See `REQUIREMENTS.md` for detailed feature specifications.

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running (if using local)
- Check connection string format
- Ensure network access is allowed (for Atlas)

### Authentication Issues
- Verify `JWT_SECRET` is set in `.env.local`
- Clear browser cookies and try again
- Check browser console for errors

### Build Errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall
- Check TypeScript errors: `npm run build`

## Development Tips

- Use the `.cursorrules` file as a reference for coding standards
- Follow the patterns established in existing code
- Test API routes using tools like Postman or Thunder Client
- Check browser console and server logs for debugging

