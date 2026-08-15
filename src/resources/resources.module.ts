import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Resource, ResourceSchema } from './entities/resource.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Resource.name, schema: ResourceSchema },
        ]),
        MulterModule.register({
            dest: './uploads',
        }),
    ],
    controllers: [ResourcesController],
    providers: [ResourcesService],
    exports: [ResourcesService],
})
export class ResourcesModule { }
