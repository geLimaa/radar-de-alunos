import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from '../../../summary/services/summary/summary.service';
import { SummaryQueryDTO } from '../../../summary/dtos/summary.dto';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  getSummary(@Query() summaryQueryDTO: SummaryQueryDTO){
    return this.summaryService.getSummary(summaryQueryDTO)
  }
}
