import { Injectable } from '@nestjs/common';
import { engagementBand } from '../../../common/engagement-band';
import { DataService } from '../../../data/data.service';
import { StudentQueryDTO } from '../../dtos/students.dto';

@Injectable()
export class StudentsService {
  
  constructor(private readonly data: DataService) {}

  getStudents(query: StudentQueryDTO){
    let students = this.data.students;

    if(query.clusterId !== undefined){
      students = students.filter(
        (student) => student.clusterId === query.clusterId,
      );
    }

    students.sort((a, b) => a.id - b.id);

    const total = students.length;
    const totalPages = Math.ceil(total / query.pageSize);
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    const pageStudents = students.slice(start, end);

    const data = pageStudents.map((student) => {
      let avgCorrectRate: number | null;

      if(
        student.correctRateLanguages !== null &&
        student.correctRateHuman !== null &&
        student.correctRateNature !== null &&
        student.correctRateMath !== null
      ){
        const totalCorrectRate =
          student.correctRateLanguages +
          student.correctRateHuman +
          student.correctRateNature +
          student.correctRateMath;

        avgCorrectRate = Math.round((totalCorrectRate / 4) * 10 ** 4) / 10 ** 4;
      } 
      else {
        avgCorrectRate = null;
      }

      return {
        id: student.id,
        name: student.name,
        studyYear: student.studyYear,
        plan: student.plan,
        clusterId: student.clusterId,
        clusterName: this.data.findCluster(student.clusterId)?.name,
        engagementBand: engagementBand(student.daysSinceLastActivity),
        daysSinceLastActivity: student.daysSinceLastActivity,
        completedMentorships: student.completedMentorships,
        avgCorrectRate,
      };
    });

    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  }
}
