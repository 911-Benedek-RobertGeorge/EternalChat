export interface MessageRecord {
  otherAddress: string;
  message: string;
  timestamp: bigint;
  direction: string;
}

export class GlobalService {
  static globalVar: Record<`0x${string}`, MessageRecord[]> = {};
}
