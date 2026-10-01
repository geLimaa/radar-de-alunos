import { Test, TestingModule } from '@nestjs/testing';
import { SummaryController } from './summary.controller';
import { SummaryService } from '../../services/summary/summary.service';

describe('SummaryController', () => {
  let controller: SummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        // Mock the service dependency to keep this controller unit test isolated.
        {
          provide: SummaryService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
