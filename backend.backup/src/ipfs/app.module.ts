import { Module } from '@nestjs/common';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';

@Module({
  controllers: [IpfsController],
  providers: [IpfsService],
})
export class IpfModule {}
