# 🔒 Backend Authorization Implementation - COMPLETE

## ✅ Implementation Status: Phase 1 Complete

---

## 🎯 What's Been Implemented

### 1. Custom Decorators Created

#### `@CurrentUser()` Decorator
**File**: `src/common/decorators/current-user.decorator.ts`

Extracts the authenticated user from the request:
```typescript
@Get()
findAll(@CurrentUser() user: any) {
  // user contains: _id, email, role, firstName, lastName
}
```

#### `@Roles()` Decorator
**File**: `src/common/decorators/roles.decorator.ts`

Specifies which roles can access a route:
```typescript
@Roles('admin', 'instructor')
@Get()
findAll() { }
```

#### `@CheckOwnership()` Decorator
**File**: `src/common/decorators/check-ownership.decorator.ts`

Marks routes that need ownership verification:
```typescript
@CheckOwnership('course')
@Patch(':id')
update(@Param('id') id: string) { }
```

---

### 2. Ownership Guard Created

**File**: `src/auth/guards/ownership.guard.ts`

**Purpose**: Verifies user owns the resource before allowing access/modification

**Features**:
- ✅ Admin bypass (admins can access everything)
- ✅ Course ownership check (instructor owns course)
- ✅ Section ownership check (instructor owns parent course)
- ✅ Lesson ownership check (instructor owns course via section)
- ✅ Enrollment access check (student/instructor/admin)

**How it works**:
```typescript
// For course: Check if course.instructorId === user._id
// For section: Check if section.course.instructorId === user._id
// For lesson: Check if lesson.section.course.instructorId === user._id
// For enrollment: 
//   - Student can access own enrollments
//   - Instructor can access enrollments for their courses
```

---

### 3. Courses Controller - Full Authorization

**File**: `src/courses/courses.controller.ts`

**Changes Applied**:

#### Authentication
```typescript
@UseGuards(JwtAuthGuard) // Added to entire controller
@ApiBearerAuth()         // Swagger documentation
```
All routes now require valid JWT token.

#### Role-Based Access Control

| Route | Roles Allowed | Notes |
|-------|---------------|-------|
| `POST /courses` | admin, instructor | Auto-assigns instructorId |
| `GET /courses` | Any authenticated | Auto-filters for instructors |
| `GET /courses/stats` | admin, instructor | Filtered by user role |
| `GET /courses/admin/stats` | admin only | Global stats |
| `GET /courses/:id` | Any authenticated | Public view |
| `PATCH /courses/:id` | admin, instructor + owner | Ownership checked |
| `PATCH /courses/:id/status` | admin, instructor + owner | Ownership checked |
| `DELETE /courses/:id` | admin, instructor + owner | Ownership checked |

#### Auto-Filtering for Instructors
```typescript
@Get()
findAll(@Query() query: GetCoursesQueryDto, @CurrentUser() user: any) {
  // Auto-filter: instructor sees only their courses
  if (user.role === 'instructor' && !query.instructorId) {
    query.instructorId = user._id;
  }
  return this.coursesService.findAll(query);
}
```

#### Ownership Protection
```typescript
@Patch(':id')
@UseGuards(RolesGuard, OwnershipGuard)
@Roles('admin', 'instructor')
@CheckOwnership('course') // ← Verifies ownership
update(@Param('id') id: string, @Body() dto, @CurrentUser() user: any) {
  return this.coursesService.update(id, dto, user);
}
```

---

### 4. Courses Service - User Context Support

**File**: `src/courses/courses.service.ts`

**Changes Applied**:

#### Filtering by User Role
```typescript
async getStats(user?: any) {
  const filter: any = {};
  
  // Instructor sees only their stats
  if (user && user.role === 'instructor') {
    filter.instructorId = user._id;
  }
  
  const total = await this.courseModel.countDocuments(filter);
  // ... rest of stats
}
```

#### Ownership Validation
```typescript
async update(id: string, dto: UpdateCourseDto, user?: any): Promise<Course> {
  const course = await this.findOne(id);
  
  // Double-check ownership (guard + service layer)
  if (user && user.role === 'instructor' && 
      course.instructorId.toString() !== user._id.toString()) {
    throw new BadRequestException('You can only update your own courses');
  }
  
  Object.assign(course, dto);
  return course.save();
}
```

---

## 🔐 Security Flow

### Example 1: Instructor Tries to Edit Another Instructor's Course

```
1. Frontend: Instructor clicks "Edit Course" on Course B
   └─ Already blocked by frontend, but they bypass it

2. API Request: PATCH /courses/course-b-id
   Headers: { Authorization: Bearer <instructor-a-token> }

3. JwtAuthGuard: ✅ Valid token, extracts user
   └─ user = { _id: 'instructor-a-id', role: 'instructor' }

4. RolesGuard: ✅ 'instructor' is in allowed roles ['admin', 'instructor']

5. OwnershipGuard: ❌ BLOCKED!
   ├─ Fetches Course B
   ├─ Course B.instructorId = 'instructor-b-id'
   ├─ user._id = 'instructor-a-id'
   └─ instructor-a-id !== instructor-b-id
   
6. Response: 403 Forbidden
   "You do not have permission to access this resource"
```

### Example 2: Admin Edits Any Course

```
1. API Request: PATCH /courses/any-course-id
   Headers: { Authorization: Bearer <admin-token> }

2. JwtAuthGuard: ✅ Valid token
3. RolesGuard: ✅ 'admin' is in allowed roles
4. OwnershipGuard: ✅ Admin bypass - always returns true
5. Service: Updates course
6. Response: 200 OK with updated course
```

### Example 3: Instructor Views Courses List

```
1. API Request: GET /courses
   Headers: { Authorization: Bearer <instructor-token> }

2. JwtAuthGuard: ✅ Valid token
   └─ user = { _id: 'instructor-id', role: 'instructor' }

3. Controller: Auto-adds filter
   query.instructorId = user._id

4. Service: Finds courses WHERE instructorId = 'instructor-id'

5. Response: Only instructor's courses returned
```

---

## 📋 What Still Needs Implementation

### Priority 1: Other Controllers (HIGH)

Apply same pattern to:

1. **Sections Controller**
   ```typescript
   @CheckOwnership('section')
   @Patch(':id')
   update(@Param('id') id: string) { }
   ```

2. **Lessons Controller**
   ```typescript
   @CheckOwnership('lesson')
   @Patch(':id')
   update(@Param('id') id: string) { }
   ```

3. **Enrollments Controller**
   ```typescript
   @CheckOwnership('enrollment')
   @Get(':id')
   findOne(@Param('id') id: string) { }
   ```

4. **Students Controller**
   ```typescript
   @Roles('admin') // Only admin can edit students
   @Patch(':id')
   update(@Param('id') id: string) { }
   ```

5. **Resources Controller**
   - Verify lesson ownership before CRUD operations

6. **Lesson Progress Controller**
   - Filter by student ID automatically
   - Verify enrollment exists

### Priority 2: Module Updates (MEDIUM)

Update each module to import/export guards:

**Example** (`courses.module.ts`):
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './entities/course.entity';
import { Section, SectionSchema } from '../sections/entities/section.entity';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';
import { Enrollment, EnrollmentSchema } from '../enrollments/entities/enrollment.entity';
import { OwnershipGuard } from '../auth/guards/ownership.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: Enrollment Schema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, OwnershipGuard],
  exports: [CoursesService],
})
export class CoursesModule {}
```

### Priority 3: Testing (HIGH)

Create test cases for:

1. **Authorization Tests**
   - Instructor cannot edit other instructor's course
   - Student cannot access instructor routes
   - Admin can access everything

2. **Filtering Tests**
   - Instructor gets only their courses
   - Student gets only their enrollments

3. **Ownership Tests**
   - Edit own resource: ✅
   - Edit other's resource: ❌
   - Admin edits any resource: ✅

---

## 🚀 How to Apply Same Pattern to Other Controllers

### Step-by-Step Guide:

#### 1. Add Guards to Controller
```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResourceController {
  // ...
}
```

#### 2. Add Role Protection
```typescript
@Post()
@UseGuards(RolesGuard)
@Roles('admin', 'instructor')
create(@Body() dto, @CurrentUser() user: any) { }
```

#### 3. Add Ownership Check
```typescript
@Patch(':id')
@UseGuards(RolesGuard, OwnershipGuard)
@Roles('admin', 'instructor')
@CheckOwnership('resource-type')
update(@Param('id') id: string) { }
```

#### 4. Add Auto-Filtering
```typescript
@Get()
findAll(@Query() query, @CurrentUser() user: any) {
  if (user.role === 'instructor') {
    query.instructorId = user._id;
  }
  // or
  if (user.role === 'student') {
    query.studentId = user._id;
  }
  return this.service.findAll(query);
}
```

#### 5. Update Service Methods
```typescript
async update(id: string, dto, user: any) {
  const resource = await this.findOne(id);
  
  // Ownership check
  if (user.role === 'instructor' && 
      resource.instructorId !== user._id) {
    throw new ForbiddenException();
  }
  
  // Update logic
}
```

---

## ✅ Verification Checklist

### For Each Controller:
- [ ] `@UseGuards(JwtAuthGuard)` on controller
- [ ] `@UseGuards(RolesGuard)` on protected routes
- [ ] `@Roles()` decorator with correct roles
- [ ] `@UseGuards(OwnershipGuard)` on edit/delete routes
- [ ] `@CheckOwnership()` decorator
- [ ] `@CurrentUser()` parameter on methods needing user
- [ ] Auto-filtering for instructor queries
- [ ] Auto-filtering for student queries
- [ ] Service methods accept `user` parameter
- [ ] Ownership validation in service layer

### For Each Module:
- [ ] Import necessary schemas for OwnershipGuard
- [ ] Provide OwnershipGuard in module
- [ ] Export service if needed by other modules

---

## 🎓 Key Concepts

### Defense in Depth
```
Frontend Protection (UI hiding)
    ↓
JWT Authentication (valid token)
    ↓
Role-Based Access (correct role)
    ↓
Ownership Verification (owns resource)
    ↓
Service Layer Validation (double-check)
```

### Automatic Filtering
Instead of trusting frontend filters, backend auto-applies them:
- Instructor queries automatically add `instructorId: user._id`
- Student queries automatically add `studentId: user._id`
- Admin queries have no filters

### Admin Bypass
Admin users always pass ownership checks for maintenance and support purposes.

---

## 📞 Support & Questions

### Common Issues:

**Q: Guard says "resource not found"**
A: Make sure the resource schema is imported in the module

**Q: Ownership check fails for valid user**
A: Check if `_id` comparison uses `.toString()` for ObjectIds

**Q: Auto-filtering not working**
A: Ensure `@CurrentUser()` is used and JWT token contains user._id

---

## 📚 Next Steps

1. ✅ **DONE**: Courses controller fully protected
2. 🔄 **TODO**: Apply pattern to Sections controller
3. 🔄 **TODO**: Apply pattern to Lessons controller
4. 🔄 **TODO**: Apply pattern to Enrollments controller
5. 🔄 **TODO**: Apply pattern to Students controller
6. 🔄 **TODO**: Update all modules with OwnershipGuard
7. 🔄 **TODO**: Write integration tests
8. 🔄 **TODO**: Update API documentation

---

**Status**: Phase 1 Complete - Core authorization framework established

**Next Phase**: Apply same patterns to remaining 5 controllers

**Estimated Time**: 2-3 hours for full implementation
