import { Controller, Get, Query } from '@nestjs/common';
import { StudentsService } from '../../services/students/students.service';
import { StudentQueryDTO } from '../../dtos/students.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService){}

  @Get()
  getStudents(@Query() studentQueryDTO: StudentQueryDTO){
    return this.studentsService.getStudents(studentQueryDTO)
  }

}
