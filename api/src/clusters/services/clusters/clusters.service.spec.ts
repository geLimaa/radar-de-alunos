import { Test, TestingModule } from '@nestjs/testing';
import { ClustersService } from './clusters.service';
import { DataService } from '../../../data/data.service';

describe('ClustersService', () => {
  let service: ClustersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClustersService,
        // Mock the data dependency to keep this unit test isolated.
        {
          provide: DataService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ClustersService>(ClustersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
