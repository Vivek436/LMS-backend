# MongoDB Setup Guide

## Project ko PostgreSQL se MongoDB mein convert kar diya gaya hai! 🎉

### Changes Made:

1. **Dependencies Updated**
   - `@nestjs/typeorm` → `@nestjs/mongoose`
   - `typeorm` + `pg` → `mongoose`

2. **Entities → Schemas**
   - TypeORM entities ko Mongoose schemas mein convert kiya
   - `@Entity()` → `@Schema()`
   - `@Column()` → `@Prop()`
   - `@PrimaryGeneratedColumn('uuid')` → MongoDB ka default `_id` (ObjectId)

3. **Services Updated**
   - `Repository<T>` → `Model<T>`
   - `@InjectRepository()` → `@InjectModel()`
   - TypeORM query methods → Mongoose methods

4. **Database Configuration**
   - `.env` file mein MongoDB URI add kiya

---

## Installation Steps

### 1. MongoDB Install Karo

**Windows:**
```bash
# MongoDB Community Edition download karo
# https://www.mongodb.com/try/download/community
# Ya Chocolatey se:
choco install mongodb
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac (Homebrew)
brew install mongodb-community
```

**Ya Docker Use Karo:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Dependencies Install Karo

```bash
npm install
```

### 3. Environment Variables Setup

`.env` file already updated hai:
```env
MONGODB_URI=mongodb://localhost:27017/lms_db
PORT=3000
NODE_ENV=development
```

**MongoDB Atlas (Cloud) use karna hai?**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms_db?retryWrites=true&w=majority
```

### 4. Application Run Karo

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 5. Test Karo

Server start hone ke baad:
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

---

## MongoDB vs PostgreSQL Differences

| Feature | PostgreSQL (Old) | MongoDB (New) |
|---------|-----------------|---------------|
| ID Type | UUID | ObjectId |
| Relations | Foreign Keys | References (populate) |
| Queries | SQL | MongoDB Query Language |
| Schema | Strict | Flexible |
| Joins | Native | $lookup / populate |

---

## Key Changes in Code

### Entity Example (Before → After)

**Before (TypeORM):**
```typescript
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;
}
```

**After (Mongoose):**
```typescript
@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true })
  firstName: string;
}
```

### Service Example (Before → After)

**Before:**
```typescript
constructor(
  @InjectRepository(Student)
  private readonly studentRepo: Repository<Student>,
) {}

async findAll() {
  return this.studentRepo.find();
}
```

**After:**
```typescript
constructor(
  @InjectModel(Student.name)
  private readonly studentModel: Model<Student>,
) {}

async findAll() {
  return this.studentModel.find().exec();
}
```

---

## MongoDB Commands (Useful)

```bash
# MongoDB Shell open karo
mongosh

# Database select karo
use lms_db

# Collections dekho
show collections

# Students dekho
db.students.find().pretty()

# Count karo
db.students.countDocuments()

# Delete all data (careful!)
db.students.deleteMany({})
```

---

## Troubleshooting

**Error: MongooseServerSelectionError**
- MongoDB service running hai? Check karo: `mongod --version`
- Connection string sahi hai? `.env` file check karo

**Error: Schema hasn't been registered**
- Module mein schema properly import kiya hai?
- `MongooseModule.forFeature([{ name: Model.name, schema: ModelSchema }])`

**Port 27017 already in use**
```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :27017
kill -9 <PID>
```

---

## Next Steps

1. ✅ MongoDB install aur run karo
2. ✅ `npm install` run karo
3. ✅ `.env` file check karo
4. ✅ `npm run start:dev` se server start karo
5. ✅ Swagger docs pe jao aur test karo

Happy Coding! 🚀
