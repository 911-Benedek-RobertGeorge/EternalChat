import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageRecordDto } from './dtos/messageRecod.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('contract-address')
  getContractAddress() {
    return { result: this.appService.getContractAddress() };
  }
  @Post('store-message')
  async storeMessage(@Body() body: MessageRecordDto) {
    return {
      result: this.appService.storeMessage(
        body.ownerAddress,
        body.otherAddress,
        body.message,
        body.timestamp,
        body.direction,
      ),
    };
  }
  @Get('stored-message')
  getMessage() {
    return { result: this.appService.getMessage() };
  }
}
