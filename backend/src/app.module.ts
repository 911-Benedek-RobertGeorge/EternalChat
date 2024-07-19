import { Module } from '@nestjs/common';
import { IpfsController } from './ipfs.controller.js';
import { IpfsService } from './ipfs.service.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [],
  controllers: [AppController,IpfsController],
  providers: [AppService,IpfsService],
})
export class AppModule {}
