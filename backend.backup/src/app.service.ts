import { Injectable } from '@nestjs/common';
import { Address, createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

import { GlobalService, MessageRecord } from './global.service';

function changeDirection(direction: string) {
  if (direction.toLowerCase() == 'incoming') {
    return 'outgoing';
  }
  return 'incoming';
}
@Injectable()
export class AppService {
  publicClient: any;
  walletClient: any;

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
    this.walletClient = createWalletClient({
      account: privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`),
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
  }

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

  getAddressToCID(): string {
    return '';
  }
}
