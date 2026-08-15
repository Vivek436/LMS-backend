import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { Section, SectionSchema } from './entities/section.entity';
import { Course, CourseSchema } from '../courses/entities/course.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Section.name, schema: SectionSchema },
            { name: Course.name, schema: CourseSchema },
        ]),
    ],
    controllers: [SectionsController],
    providers: [SectionsService],
    exports: [SectionsService],
})
export class SectionsModule { }
