import { Injectable } from '@nestjs/common';
import type { HeliaLibp2p } from 'helia';
import { GlobalService } from './global.service.js';


@Injectable()
export class IpfsService {
  private helia: HeliaLibp2p<any>;

  async createHeliaInstance() {
    const { createHelia } = await import('helia');
    const { createLibp2p } = await import('libp2p');
    const { bootstrap } = await import('@libp2p/bootstrap');
    const { identify } = await import('@libp2p/identify');
    const { tcp } = await import('@libp2p/tcp');
    const { noise } = await import('@chainsafe/libp2p-noise');
    const { yamux } = await import('@chainsafe/libp2p-yamux');
    const libp2p = await createLibp2p({
      datastore: GlobalService.datastore,
      addresses: {
        listen: [
          '/ip4/127.0.0.1/tcp/0'
        ]
      },
      transports: [
        tcp()
      ],
      connectionEncryption: [
        noise()
      ],
      streamMuxers: [
        yamux()
      ],
      peerDiscovery: [
        bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
          ]
        })
      ],
      services: {
        identify: identify()
      }
    })

    console.log(libp2p);


    this.helia = await createHelia({ blockstore: GlobalService.blockstore, datastore: GlobalService.datastore, libp2p: libp2p });
  }

  async getHelia(): Promise<HeliaLibp2p> {
    if (!this.helia) {
      this.createHeliaInstance()
    }

    return this.helia;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.helia != null) {
      await this.helia.stop();
    }
  }

  async postToIPFS(address: string) {
    const { json } = await import('@helia/json');
    if (this.helia == null) {
      this.createHeliaInstance();
    }

    const j = json(this.helia)
    const data = GlobalService.globalVar[address];
    if (!data) {
      return ""
    }
    console.log(data);

    const cid = await j.add(JSON.stringify(data))
    console.log(cid);

    const result = await this.helia.pins.add(cid, { depth: 100 });
    console.log("the rez of the pining ", result)
    console.log("content pinned with CID", cid.toString())

    const obj = await j.get(cid)

    console.log(obj);


    return cid.toString();


  }

  async getFromCid(cid: string){
    const { json } = await import('@helia/json');
    const { CID } = await import('multiformats/cid')
    if (this.helia == null) {
      this.createHeliaInstance();
    }

    const j = json(this.helia)
    const obj = await j.get(CID.parse(cid))
    return obj
  }

}
