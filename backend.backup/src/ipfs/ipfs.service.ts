import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { json } from '@helia/json'
// import { FsBlockstore } from 'blockstore-fs'

@Injectable()
export class IpfsService implements OnModuleInit, OnModuleDestroy {
  private helia: any;

  async onModuleInit() {
    console.log("helo");
    const { createHelia } = await import('helia')
  
    // create a Helia node
    // const test = await createHelia();
    // console.log('Helia node is ready');
  }

  async onModuleDestroy() {
    // await this.helia.stop();
  }

  async addData(data: string) {
    // const j = json(this.helia)
    // const cid = await j.add({ hello: 'world' })
    // console.log(cid.toString());
    // return cid.toString();
  }
}
