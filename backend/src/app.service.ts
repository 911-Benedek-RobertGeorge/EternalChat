import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): string {
    return '0x63D7192Ced6bfb8bcC059B1582d1c667222626f0';
  }
}
