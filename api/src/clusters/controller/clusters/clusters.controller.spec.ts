import { Test, TestingModule } from '@nestjs/testing';
import { ClustersController } from './clusters.controller';
import { ClustersService } from '../../services/clusters/clusters.service';

describe('ClustersController', () => {
  let controller: ClustersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClustersController],
      providers: [
        // Mock the service dependency to keep this controller unit test isolated.
        {
          provide: ClustersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClustersController>(ClustersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
