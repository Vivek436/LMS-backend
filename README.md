# 📚 LMS NestJS - Learning Management System CRUD API

## Project Structure

```
lms-nestjs/
├── src/
│   ├── main.ts                          # App entry point + Swagger setup
│   ├── app.module.ts                    # Root module (TypeORM + Config)
│   │
│   ├── common/
│   │   ├── dto/
│   │   │   └── pagination.dto.ts        # Reusable pagination DTO
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Global error handler
│   │   └── interceptors/
│   │       └── response.interceptor.ts  # Uniform API response wrapper
│   │
│   ├── instructors/
│   │   ├── entities/instructor.entity.ts
│   │   ├── dto/instructor.dto.ts
│   │   ├── instructors.service.ts
│   │   ├── instructors.controller.ts
│   │   └── instructors.module.ts
│   │
│   ├── courses/
│   │   ├── entities/course.entity.ts
│   │   ├── dto/course.dto.ts
│   │   ├── courses.service.ts
│   │   ├── courses.controller.ts
│   │   └── courses.module.ts
│   │
│   ├── students/
│   │   ├── entities/student.entity.ts
│   │   ├── dto/student.dto.ts
│   │   ├── students.service.ts
│   │   ├── students.controller.ts
│   │   └── students.module.ts
│   │
│   └── enrollments/
│       ├── entities/enrollment.entity.ts
│       ├── dto/enrollment.dto.ts
│       ├── enrollments.service.ts
│       ├── enrollments.controller.ts
│       └── enrollments.module.ts
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup & Installation

```bash
# 1. Dependencies install karo
npm install

# 2. PostgreSQL database banao
createdb lms_db

# 3. .env file configure karo
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=lms_db

# 4. Development mode mein run karo
npm run start:dev
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`  
Swagger Docs: `http://localhost:3000/api/docs`

---

### 👨‍🏫 Instructors `/api/v1/instructors`

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/`                         | Naya instructor create karo        |
| GET    | `/`                         | Saare instructors list (paginated) |
| GET    | `/:id`                      | ID se ek instructor dhundo         |
| PATCH  | `/:id`                      | Instructor update karo             |
| PATCH  | `/:id/deactivate`           | Instructor inactive karo           |
| DELETE | `/:id`                      | Instructor delete karo             |

**POST /instructors** - Request body:
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "email": "rahul@example.com",
  "phone": "+91 9876543210",
  "bio": "Expert web developer",
  "qualification": "PhD Computer Science",
  "specialization": "React, Node.js"
}
```

---

### 📚 Courses `/api/v1/courses`

| Method | Endpoint          | Description                           |
|--------|-------------------|---------------------------------------|
| POST   | `/`               | Naya course create karo               |
| GET    | `/`               | Saare courses (filter: level/category/status) |
| GET    | `/stats`          | Course statistics                     |
| GET    | `/:id`            | ID se ek course                       |
| PATCH  | `/:id`            | Course update karo                    |
| PATCH  | `/:id/status`     | Status change (publish/archive/draft) |
| DELETE | `/:id`            | Course delete karo                    |

**POST /courses** - Request body:
```json
{
  "title": "Complete React Course",
  "description": "React ka full course",
  "level": "beginner",
  "category": "Programming",
  "price": 999.00,
  "durationHours": 40,
  "totalLessons": 120,
  "language": "Hindi",
  "instructorId": "uuid-here"
}
```

**Query filters:** `?search=react&level=beginner&category=Programming&status=published&page=1&limit=10`

---

### 👨‍🎓 Students `/api/v1/students`

| Method | Endpoint            | Description                      |
|--------|---------------------|----------------------------------|
| POST   | `/`                 | Naya student register karo       |
| GET    | `/`                 | Saare students (filter: status/city) |
| GET    | `/:id`              | ID se ek student (enrollments ke saath) |
| GET    | `/:id/stats`        | Student dashboard stats          |
| PATCH  | `/:id`              | Student profile update           |
| PATCH  | `/:id/suspend`      | Student suspend karo             |
| PATCH  | `/:id/activate`     | Student activate karo            |
| DELETE | `/:id`              | Student delete karo              |

**POST /students** - Request body:
```json
{
  "firstName": "Priya",
  "lastName": "Verma",
  "email": "priya@example.com",
  "phone": "+91 9876543210",
  "dateOfBirth": "2000-05-15",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

---

### 📝 Enrollments `/api/v1/enrollments`

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | `/`                       | Student ko course mein enroll karo   |
| GET    | `/`                       | Saare enrollments (multi-filter)     |
| GET    | `/stats`                  | Overall enrollment + revenue stats   |
| GET    | `/:id`                    | Ek enrollment detail                 |
| PATCH  | `/:id/progress`           | Progress update (0-100%)             |
| PATCH  | `/:id/review`             | Student review + rating submit       |
| PATCH  | `/:id/payment`            | Payment status update                |
| PATCH  | `/:id/status`             | Enrollment drop/suspend              |
| POST   | `/:id/certificate`        | Certificate issue karo               |
| DELETE | `/:id`                    | Enrollment delete karo               |

**POST /enrollments** - Request body:
```json
{
  "studentId": "student-uuid",
  "courseId": "course-uuid",
  "amountPaid": 999.00,
  "paymentStatus": "paid",
  "paymentReference": "TXN123456789"
}
```

**PATCH /enrollments/:id/progress**
```json
{
  "progressPercent": 75,
  "lessonsCompleted": 90
}
```

**PATCH /enrollments/:id/review**
```json
{
  "rating": 5,
  "review": "Bahut acha course tha! Clearly explained."
}
```

---

## Database Relations

```
Instructor ──< Course ──< Enrollment >── Student
(One-to-Many)           (Many-to-Many join table)
```

- Ek instructor ke multiple courses ho sakte hain
- Ek course mein multiple students enroll ho sakte hain
- Ek student multiple courses mein enroll ho sakta hai
- Enrollment table mein progress, payment, review sab track hota hai

---

## API Response Format

Saare responses ek uniform format mein aate hain:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Student with ID 'xyz' not found",
  "path": "/api/v1/students/xyz",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Enums Reference

**CourseLevel:** `beginner` | `intermediate` | `advanced`  
**CourseStatus:** `draft` | `published` | `archived`  
**StudentStatus:** `active` | `inactive` | `suspended`  
**InstructorStatus:** `active` | `inactive`  
**EnrollmentStatus:** `active` | `completed` | `dropped` | `suspended`  
**PaymentStatus:** `pending` | `paid` | `refunded` | `failed`

---

## Tech Stack

- **Framework:** NestJS 10
- **Database:** PostgreSQL + TypeORM
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger (@nestjs/swagger)
- **Config:** @nestjs/config (.env support)
