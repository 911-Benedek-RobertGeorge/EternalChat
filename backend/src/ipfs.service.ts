import { Injectable } from '@nestjs/common';
import type { HeliaLibp2p } from 'helia';
import { GlobalService, MessageRecord } from './global.service.js';

// Remove the last ']' to be able to append properly data
// In order to be coherent, we also remove the first '['
function preprocessData(jsonString) {
  if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
      return jsonString.slice(1, -1);
  } else {
      throw new Error('Invalid JSON array format');
  }
}

// Add the last ']'
// In order to match the coherence of the preprocessData we also add the first '['
function postprocessData(string) {
  return '[' + string + ']';
}

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



    this.helia = await createHelia({ blockstore: GlobalService.blockstore, datastore: GlobalService.datastore, libp2p: libp2p });
  }

  async getHelia(): Promise<HeliaLibp2p> {
    if (!this.helia) {
      await this.createHeliaInstance()
    }

    return this.helia;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.helia != null) {
      await this.helia.stop();
    }
  }

  async postToIPFS(ownerAddress: string, otherAddress: string, previousCid: string) {
    const { json } = await import('@helia/json');
    if (this.helia == null) {
      await this.createHeliaInstance();
    }

    const j = json(this.helia)

    const data = GlobalService.globalVar[ownerAddress].filter((message: MessageRecord) => message.otherAddress == otherAddress);
    if (!data) {
      return null
    }

    let newData : MessageRecord[] = data.slice();

    if(previousCid && previousCid != null){
      const { CID } = await import('multiformats/cid')
      const obj : MessageRecord[] = JSON.parse(postprocessData(await j.get(CID.parse(previousCid))));
      newData = obj;
    
      for (const elem of data){
        const exists = obj.some((item) => JSON.stringify(item) === JSON.stringify(elem));
        if (!exists) {
          newData.push(elem);
        }
      }
    }

    const cid = await j.add(preprocessData(JSON.stringify(newData)))
    console.log(cid);

    const result = await this.helia.pins.add(cid, { depth: 100 });
    console.log("content pinned with CID", cid.toString())

    return cid.toString();


  }

  async getFromCid(cid: string) {
    const { json } = await import('@helia/json');
    const { CID } = await import('multiformats/cid')
    if (this.helia == null) {
      await this.createHeliaInstance();
    }

    const j = json(this.helia)
    const obj = await j.get(CID.parse(cid))
    const newobjJson = postprocessData(obj)
    
    return newobjJson
  }

}
