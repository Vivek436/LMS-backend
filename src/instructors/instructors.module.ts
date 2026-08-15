import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from './entities/instructor.entity';
import { InstructorsService } from './instructors.service';
import { InstructorsController } from './instructors.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Instructor.name, schema: InstructorSchema }])],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService], // enrollment module use karega
})
export class InstructorsModule { }
