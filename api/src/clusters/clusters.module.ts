import { Module } from '@nestjs/common';
import { ClustersController } from './controller/clusters/clusters.controller';
import { ClustersService } from './services/clusters/clusters.service';
import { DataModule } from 'src/data/data.module';

@Module({ 
  imports: [DataModule],
  controllers: [ClustersController],
  providers: [ClustersService]
})
export class ClustersModule {}
