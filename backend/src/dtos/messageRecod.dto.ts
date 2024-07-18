import { ApiProperty } from '@nestjs/swagger';

export class MessageRecordDto {
  @ApiProperty({ type: String, required: true, default: 'Owner Address' })
  ownerAddress: string;
  @ApiProperty({ type: String, required: true, default: 'Other Address' })
  otherAddress: string;
  @ApiProperty({ type: String, required: true, default: 'encrypted message' })
  message: string;
  @ApiProperty({ type: BigInt, required: true, default: 'timestamp' })
  timestamp: bigint;
  @ApiProperty({
    type: String,
    required: true,
    default: 'incoming',
    description: 'Incoming or Outgoing',
  })
  direction: string;
}
