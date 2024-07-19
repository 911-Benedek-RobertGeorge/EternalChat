import { ApiProperty } from "@nestjs/swagger";

export class AddressToPost {
    @ApiProperty({ type: String, required: true, default: '0xC6CbDd7D90458c5e1003DdE243bF1561efAeE516' })
    public address: string;
}