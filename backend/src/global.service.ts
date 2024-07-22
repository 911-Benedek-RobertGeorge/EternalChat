export interface MessageRecord {
  otherAddress: string;
  message: string;
  timestamp: number;
  direction: string;
}
import { FsBlockstore } from 'blockstore-fs'
import { FsDatastore } from 'datastore-fs'

export class GlobalService {
  static globalVar: Record<`0x${string}`, MessageRecord[]> = {};
  static blockstore = new FsBlockstore('../data/blockstore');
  static datastore = new FsDatastore('../data/datastore')
}
