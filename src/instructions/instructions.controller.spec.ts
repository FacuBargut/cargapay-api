import { Test, TestingModule } from '@nestjs/testing';
import { InstructionsController } from './instructions.controller';

describe('InstructionsController', () => {
  let controller: InstructionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructionsController],
    }).compile();

    controller = module.get<InstructionsController>(InstructionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
