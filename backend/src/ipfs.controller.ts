import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IpfsService } from './ipfs.service.js';
import { AddressToPost } from './dtos/cid.dto.js';

@Controller()
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Get("getHelia")
  async getHeliaVersion(): Promise<string> {
    const helia = await this.ipfsService.getHelia();
    return 'Helia is running, PeerId ' + helia.libp2p.peerId.toString();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.ipfsService.onApplicationShutdown();
  }

  @Post('pin')
  async postToIpfs(@Body() body: AddressToPost) {
    return await this.ipfsService.postToIPFS(body.address);
  }

  @Post('get-from-cid')
  async getFromCid(@Query('cid') cid: string){
    return await this.ipfsService.getFromCid(cid)
  }
}
