import { Controller, Post, Body } from '@nestjs/common';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Post('pin')
  async pinData(@Body('data') data: string) {
    const cid = await this.ipfsService.addData(data);
    return { cid };
  }
}
