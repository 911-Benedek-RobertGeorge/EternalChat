import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpfModule } from './ipfs/app.module';
// import { IpfsModule } from './IPFS/ipfs.module';

@Module({
  imports: [IpfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
