import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Student, StudentSchema } from '../students/entities/student.entity';
import { Instructor, InstructorSchema } from '../instructors/entities/instructor.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Student.name, schema: StudentSchema },
            { name: Instructor.name, schema: InstructorSchema },
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }