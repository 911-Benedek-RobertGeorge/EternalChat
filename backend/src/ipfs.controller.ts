import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IpfsService } from './ipfs.service.js';
import { AddressToPost } from './dtos/addressToPost.dto.js';

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
    return { result: await this.ipfsService.postToIPFS(body.ownerAddress,body.otherAddress, body.previousCid)};
  }

  @Get('get-from-cid')
  async getFromCid(@Query('cid') cid: string){
    return { result:  await this.ipfsService.getFromCid(cid)}
  }
}
