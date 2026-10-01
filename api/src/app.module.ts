import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DataModule } from './data/data.module';
import { HealthModule } from './health/health.module';
import { ClustersModule } from './clusters/clusters.module';
import { StudentsModule } from './students/students.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DataModule,
    HealthModule,
    ClustersModule,
    StudentsModule,
    SummaryModule,
  ],
})
export class AppModule {}
