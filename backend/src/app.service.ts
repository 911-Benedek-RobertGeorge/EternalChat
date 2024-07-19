import { Injectable } from '@nestjs/common';
import { Address } from 'viem';

import { GlobalService, MessageRecord } from './global.service.js';

function changeDirection(direction: string) {
  if (direction.toLowerCase() == 'incoming') {
    return 'outgoing';
  }
  return 'incoming';
}
@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): string {
    return process.env.CONTRACT_ADDRESS as Address;
  }

  storeMessage(
    ownerAddress: string,
    otherAddress: string,
    message: string,
    timestamp: number,
    direction: string,
  ) {
    if (!GlobalService.globalVar[ownerAddress]) {
      GlobalService.globalVar[ownerAddress] = [];
    }
    if (!GlobalService.globalVar[otherAddress]) {
      GlobalService.globalVar[otherAddress] = [];
    }
    GlobalService.globalVar[ownerAddress].push({
      otherAddress,
      message,
      timestamp,
      direction,
    } as MessageRecord);

    GlobalService.globalVar[otherAddress].push({
      otherAddress: ownerAddress,
      message,
      timestamp,
      direction: changeDirection(direction),
    } as MessageRecord);
    
    return;
  }

  getMessage(address: `0x${string}`): string {
    return JSON.stringify(GlobalService.globalVar[address]);
  }

}
