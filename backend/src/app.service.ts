import { Injectable } from '@nestjs/common';
import { Address, createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

import * as ethernalChatJson from './assets/EthernalChat.json';

import { GlobalService } from './utils/global.service';

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
    timestamp: bigint,
    direction: string,
  ) {
    if (
      !GlobalService.globalVar[ownerAddress] ||
      !GlobalService.globalVar[otherAddress]
    ) {
      GlobalService.globalVar[ownerAddress] = [];
      GlobalService.globalVar[otherAddress] = [];
    }
    GlobalService.globalVar[ownerAddress].push({
      otherAddress,
      message,
      timestamp,
      direction,
    });

    GlobalService.globalVar[otherAddress].push({
      ownerAddress,
      message,
      timestamp,
      direction: changeDirection(direction),
    });

    return;
  }

  getMessage(): string {
    console.log(GlobalService.globalVar);
    return JSON.stringify(GlobalService.globalVar);
  }

  getAddressToCID(): string {
    return;
  }
}
