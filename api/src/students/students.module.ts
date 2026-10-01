import { Module } from '@nestjs/common';
import { StudentsController } from './controller/students/students.controller';
import { StudentsService } from './services/students/students.service';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [StudentsController],
  providers: [StudentsService]
})
export class StudentsModule {}
