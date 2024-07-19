import { Controller, Get, Body, Post, Param, Query } from '@nestjs/common';
import { AppService } from './app.service.js';
import { MessageRecordDto } from './dtos/messageRecod.dto.js';

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
  getMessage(@Query('address') address: `0x${string}`) {
    return { result: this.appService.getMessage(address) };
  }
}
