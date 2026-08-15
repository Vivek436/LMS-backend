import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from './courses/courses.module';
import { StudentsModule } from './students/students.module';
import { InstructorsModule } from './instructors/instructors.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { ResourcesModule } from './resources/resources.module';
import { LessonProgressModule } from './lesson-progress/lesson-progress.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Config module - environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/lms_db'),
      }),
    }),

    // Feature modules
    AuthModule,
    CoursesModule,
    StudentsModule,
    InstructorsModule,
    EnrollmentsModule,
    SectionsModule,
    LessonsModule,
    ResourcesModule,
    LessonProgressModule,
    PaymentsModule,
    NotificationsModule,
    UsersModule,
  ],
})
export class AppModule { }
