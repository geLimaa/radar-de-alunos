import { Controller, Get, Query } from '@nestjs/common';
import { StudentsService } from '../../services/students/students.service';
import { StudentQueryDTO } from 'src/students/dtos/students.dto';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService){}

  @Get()
  getStudents(@Query() studentQueryDTO: StudentQueryDTO){
    return this.studentsService.getStudents(studentQueryDTO)
  }

}

