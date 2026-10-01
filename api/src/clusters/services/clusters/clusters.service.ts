import { Injectable } from '@nestjs/common';
import { DataService } from '../../../data/data.service';

@Injectable()
export class ClustersService {
  
  constructor(private readonly data: DataService) {}

  fetchClustersData(){
    const referenceDate = this.data.clustersFile.referenceDate;
    const k = this.data.clustersFile.k;
    const studentCount = this.data.clustersFile.studentCount;
    const kSelection = this.data.clustersFile.kSelection;
    
    const data = this.data.clustersFile.clusters.map((cluster) => ({
      ...cluster,
      share: Math.round((cluster.size / studentCount) * 10 ** 4) / 10000,
    }));

    return {
      referenceDate,
      k,
      studentCount,
      kSelection,
      data,
    };
  }

}
