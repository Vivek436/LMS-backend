import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonProgressController } from './lesson-progress.controller';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgress, LessonProgressSchema } from './entities/lesson-progress.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LessonProgress.name, schema: LessonProgressSchema },
        ]),
    ],
    controllers: [LessonProgressController],
    providers: [LessonProgressService],
    exports: [LessonProgressService],
})
export class LessonProgressModule { }
