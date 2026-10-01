import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../../../data/data.service';
import { SummaryQueryDTO } from '../../dtos/summary.dto';
import { engagementBand } from '../../../common/engagement-band';

@Injectable()
export class SummaryService {
  constructor(private readonly dataService: DataService) {}

  getSummary(query: SummaryQueryDTO){ 
    let students = [...this.dataService.students];

    if(query.clusterId !== undefined){
      if(this.dataService.findCluster(query.clusterId)){
        students = students.filter((student) => {
          return student.clusterId == query.clusterId;
        });
      }
      else{
        throw new NotFoundException("Cluster não encontrado");
      } 
    }

    let engagement = {
      engaged: 0,
      slipping: 0,
      disengaged: 0,
      never: 0
    };

    students.forEach((student) => {
      let studentEngagement = engagementBand(student.daysSinceLastActivity);

      if(studentEngagement == "engaged"){ engagement.engaged++; }
      if(studentEngagement == "slipping"){ engagement.slipping++; }
      if(studentEngagement == "disengaged"){ engagement.disengaged++; }
      if(studentEngagement == "never"){ engagement.never++; }
    });

    let correctRateLanguagesSum = 0;
    let correctRateHumanSum = 0;
    let correctRateNatureSum = 0;
    let correctRateMathSum = 0;
    let correctRateLanguagesCount = 0;
    let correctRateHumanCount = 0;
    let correctRateNatureCount = 0;
    let correctRateMathCount = 0;

    let avgEssayScoreSum = 0;
    let avgEssayScoreCount = 0;
    
    let completedMentorshipsSum = 0;
    let lessonsLast30dSum = 0;

    students.forEach((student) => {
      completedMentorshipsSum += student.completedMentorships; 
      lessonsLast30dSum += student.lessonsLast30d; 

      if(student.correctRateLanguages !== null){ 
        correctRateLanguagesSum += student.correctRateLanguages; 
        correctRateLanguagesCount++;
      }
      if(student.correctRateHuman !== null){ 
        correctRateHumanSum += student.correctRateHuman; 
        correctRateHumanCount++;
      }
      if(student.correctRateNature !== null){ 
        correctRateNatureSum += student.correctRateNature; 
        correctRateNatureCount++;
      }
      if(student.correctRateMath !== null){ 
        correctRateMathSum += student.correctRateMath; 
        correctRateMathCount++;
      }
      if(student.avgEssayScore !== null){ 
        avgEssayScoreSum += student.avgEssayScore; 
        avgEssayScoreCount++;
      }
    });

    let correctRateLanguagesMean = null;
    let correctRateHumanMean = null;
    let correctRateNatureMean = null;
    let correctRateMathMean = null;
    let avgEssayScoreMean = null;    

    let completedMentorshipsMean = null;
    let lessonsLast30dMean = null;

    if(students.length > 0){
      completedMentorshipsMean = completedMentorshipsSum / students.length;
      lessonsLast30dMean = lessonsLast30dSum / students.length;
      
      completedMentorshipsMean = Math.round(completedMentorshipsMean * 10 ** 2) / 10 ** 2;
      lessonsLast30dMean = Math.round(lessonsLast30dMean * 10 ** 2) / 10 ** 2;
    }

    if(correctRateLanguagesCount > 0){
      correctRateLanguagesMean = correctRateLanguagesSum / correctRateLanguagesCount;
      
      correctRateLanguagesMean = Math.round(correctRateLanguagesMean * 10 ** 4) / 10 ** 4;
    }
    if(correctRateHumanCount > 0){
      correctRateHumanMean = correctRateHumanSum / correctRateHumanCount;
      
      correctRateHumanMean = Math.round(correctRateHumanMean * 10 ** 4) / 10 ** 4;
    }
    if(correctRateNatureCount > 0){
      correctRateNatureMean = correctRateNatureSum / correctRateNatureCount;
      
      correctRateNatureMean = Math.round(correctRateNatureMean * 10 ** 4) / 10 ** 4;
    }
    if(correctRateMathCount > 0){
      correctRateMathMean = correctRateMathSum / correctRateMathCount;
      
      correctRateMathMean = Math.round(correctRateMathMean * 10 ** 4) / 10 ** 4;
    }
    if(avgEssayScoreCount > 0){
      avgEssayScoreMean = avgEssayScoreSum / avgEssayScoreCount;
      
      avgEssayScoreMean = Math.round(avgEssayScoreMean * 10 ** 2) / 10 ** 2;
    }

    const averages = {
      correctRateLanguages: correctRateLanguagesMean,
      correctRateHuman: correctRateHumanMean,
      correctRateNature: correctRateNatureMean,
      correctRateMath: correctRateMathMean,
      avgEssayScore: avgEssayScoreMean,
      completedMentorships: completedMentorshipsMean,
      lessonsLast30d: lessonsLast30dMean
    }

    return {
      referenceDate: this.dataService.clustersFile.referenceDate,
      clusterId: query.clusterId ?? null,
      totalStudents: students.length,
      engagement,
      averages,
    }

  }
}
