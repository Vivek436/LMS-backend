# Complete LMS Fullstack Setup Guide

## 🎯 Project Overview

**LMS (Learning Management System)** - Complete fullstack application

### Backend (NestJS + MongoDB)
- RESTful API
- MongoDB database
- CRUD operations for Courses, Students, Instructors, Enrollments
- Swagger documentation

### Frontend (Next.js + TypeScript)
- Modern React application
- Responsive design with Tailwind CSS
- Real-time data fetching with React Query
- Type-safe with TypeScript

---

## 📦 Complete Setup Instructions

### Step 1: MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

#### Option B: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` file

---

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd lms-nestjs

# Install dependencies
npm install

# Update .env file
# MONGODB_URI=mongodb://localhost:27017/lms_db
# PORT=3000
# NODE_ENV=development

# Start backend server
npm run start:dev
```

**Backend will run on:** http://localhost:3000

**Swagger Docs:** http://localhost:3000/api/docs

---

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd lms-frontend

# Install dependencies
npm install

# Verify .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Start frontend server
npm run dev
```

**Frontend will run on:** http://localhost:3001

---

## 🧪 Testing the Application

### 1. Check Backend Health

Open browser: http://localhost:3000/api/docs

You should see Swagger documentation.

### 2. Test API Endpoints

#### Create a Student
```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Rahul",
    "lastName": "Kumar",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

#### Create an Instructor
```bash
curl -X POST http://localhost:3000/api/v1/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": "priya@example.com",
    "specialization": "Web Development",
    "qualification": "M.Tech Computer Science"
  }'
```

#### Create a Course
```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Web Development",
    "description": "Learn HTML, CSS, JavaScript, React, Node.js",
    "level": "beginner",
    "status": "published",
    "category": "Programming",
    "price": 2999,
    "durationHours": 40,
    "totalLessons": 120,
    "language": "Hindi"
  }'
```

### 3. Check Frontend

Open browser: http://localhost:3001

Navigate through:
- Home page
- Courses page
- Students page
- Instructors page
- Enrollments page

---

## 📂 Project Structure

```
lms-nestjs/                    # Root directory
├── src/                       # Backend source
│   ├── courses/              # Courses module
│   ├── students/             # Students module
│   ├── instructors/          # Instructors module
│   ├── enrollments/          # Enrollments module
│   ├── common/               # Shared utilities
│   ├── app.module.ts         # Main app module
│   └── main.ts               # Entry point
├── lms-frontend/             # Frontend directory
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities & API
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   └── package.json
├── .env                      # Backend environment
├── package.json             # Backend dependencies
└── MONGODB_SETUP.md         # MongoDB guide
```

---

## 🔧 Configuration Files

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017/lms_db
PORT=3000
NODE_ENV=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 🚀 Features Implemented

### Backend Features
✅ Course Management (CRUD)
✅ Student Management (CRUD)
✅ Instructor Management (CRUD)
✅ Enrollment System (CRUD)
✅ Pagination & Search
✅ Filters (status, level, category)
✅ Progress Tracking
✅ Payment Management
✅ Certificate Generation
✅ Statistics & Analytics
✅ Swagger Documentation
✅ MongoDB Integration
✅ Validation & Error Handling

### Frontend Features
✅ Responsive Design
✅ Course Listing & Filtering
✅ Student Management
✅ Instructor Profiles
✅ Enrollment Tracking
✅ Progress Visualization
✅ Payment Status Display
✅ Search Functionality
✅ Pagination
✅ Loading States
✅ Error Handling
✅ Type Safety (TypeScript)

---

## 🎨 Tech Stack Summary

### Backend
- **Framework**: NestJS
- **Database**: MongoDB
- **ODM**: Mongoose
- **Validation**: class-validator
- **Documentation**: Swagger
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18
- **Styling**: Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 📊 API Endpoints Overview

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create course
- `PATCH /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course
- `PATCH /api/v1/courses/:id/status` - Change status

### Students
- `GET /api/v1/students` - Get all students
- `GET /api/v1/students/:id` - Get student by ID
- `POST /api/v1/students` - Create student
- `PATCH /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student
- `PATCH /api/v1/students/:id/suspend` - Suspend student
- `PATCH /api/v1/students/:id/activate` - Activate student

### Instructors
- `GET /api/v1/instructors` - Get all instructors
- `GET /api/v1/instructors/:id` - Get instructor by ID
- `POST /api/v1/instructors` - Create instructor
- `PATCH /api/v1/instructors/:id` - Update instructor
- `DELETE /api/v1/instructors/:id` - Delete instructor

### Enrollments
- `GET /api/v1/enrollments` - Get all enrollments
- `GET /api/v1/enrollments/:id` - Get enrollment by ID
- `POST /api/v1/enrollments` - Create enrollment
- `PATCH /api/v1/enrollments/:id/progress` - Update progress
- `POST /api/v1/enrollments/:id/review` - Submit review
- `PATCH /api/v1/enrollments/:id/payment` - Update payment
- `POST /api/v1/enrollments/:id/certificate` - Issue certificate

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- Check port 27017 is not blocked

### Issue: Backend Port Already in Use
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue: CORS Error in Frontend
**Solution**:
- Backend mein `app.enableCors()` enabled hai? (main.ts)
- API URL sahi hai? (frontend .env.local)

### Issue: TypeScript Errors
**Solution**:
```bash
# Backend
npm install

# Frontend
cd lms-frontend
npm install
```

---

## 📈 Next Steps & Enhancements

### Immediate Improvements
- [ ] Add authentication (JWT)
- [ ] Add authorization (roles & permissions)
- [ ] File upload for images
- [ ] Email notifications
- [ ] Payment gateway integration

### Advanced Features
- [ ] Real-time chat
- [ ] Video streaming
- [ ] Quiz & assignments
- [ ] Certificates with QR codes
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Multi-language support

### DevOps
- [ ] Docker compose setup
- [ ] CI/CD pipeline
- [ ] Unit & E2E tests
- [ ] Monitoring & logging
- [ ] Production deployment

---

## 📝 Development Commands

### Backend
```bash
npm run start:dev      # Development mode
npm run build          # Build for production
npm run start:prod     # Production mode
npm run lint           # Lint code
```

### Frontend
```bash
npm run dev           # Development mode
npm run build         # Build for production
npm run start         # Production mode
npm run lint          # Lint code
```

---

## 🎓 Learning Resources

- **NestJS**: https://docs.nestjs.com
- **MongoDB**: https://docs.mongodb.com
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Query**: https://tanstack.com/query/latest

---

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

## 🤝 Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Test API endpoints in Swagger
4. Check browser console for frontend errors

---

**Congratulations! 🎉**

Aapka complete fullstack LMS application ready hai!

Backend: http://localhost:3000
Frontend: http://localhost:3001
Swagger: http://localhost:3000/api/docs

Happy Coding! 🚀
