import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from '../../../data/data.service';
import { SummaryService } from './summary.service';

describe('SummaryService', () => {
  let service: SummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        // Mock the data dependency to keep this unit test isolated.
        {
          provide: DataService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
