import { ApiProperty } from '@nestjs/swagger';

export class MessageRecordDto {
  @ApiProperty({ type: String, required: true, default: '0xC6CbDd7D90458c5e1003DdE243bF1561efAeE516' })
  ownerAddress: string;
  @ApiProperty({ type: String, required: true, default: '0xa18d5e848Aca5A5Eaf9cD2d05bAe1D60C2f4884d' })
  otherAddress: string;
  @ApiProperty({ type: String, required: true, default: 'Encrypted Message' })
  message: string;
  @ApiProperty({ type: Number, required: true, default: '1' })
  timestamp: number;
  @ApiProperty({
    type: String,
    required: true,
    default: 'incoming',
    description: 'Incoming or Outgoing',
  })
  direction: string;
}
