import { Test, type TestingModule } from '@nestjs/testing';
import { IpfsController } from './ipfs.controller.js';
import { IpfsService } from './ipfs.service.js';

describe('AppController', () => {
  let appController: IpfsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IpfsController],
      providers: [IpfsService],
    }).compile();

    appController = app.get<IpfsController>(IpfsController);
  });

  describe('root', () => {
    it('should return "Helia is running"', async () => {
      expect(await appController.getHeliaVersion()).toContain(
        'Helia is running',
      );

      await appController.onApplicationShutdown();
    });
  });
});
