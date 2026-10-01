import { Controller, Get } from '@nestjs/common';
import { ClustersService } from '../../services/clusters/clusters.service';


@Controller('clusters')
export class ClustersController {

  constructor(private clusterService: ClustersService){}

  @Get()
  getClusters(){
    return this.clusterService.fetchClustersData()
  }
}
