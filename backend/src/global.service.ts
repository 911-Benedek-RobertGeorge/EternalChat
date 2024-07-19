export interface MessageRecord {
  otherAddress: string;
  message: string;
  timestamp: number;
  direction: string;
}
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'

export class GlobalService {
  static globalVar: Record<`0x${string}`, MessageRecord[]> = {};
  static blockstore = new MemoryBlockstore();
  static datastore = new MemoryDatastore();
}
