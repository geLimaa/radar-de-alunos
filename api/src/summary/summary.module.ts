import { Module } from '@nestjs/common';
import { SummaryController } from './controller/summary/summary.controller';
import { SummaryService } from './services/summary/summary.service';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [SummaryController],
  providers: [SummaryService]
})
export class SummaryModule {}
