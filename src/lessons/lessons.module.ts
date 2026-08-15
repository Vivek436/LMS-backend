import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson, LessonSchema } from './entities/lesson.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule { }
