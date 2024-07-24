export interface MessageRecord {
  otherAddress: string;
  message: string;
  timestamp: number;
  direction: string;
}
import { FsBlockstore } from 'blockstore-fs'
import {FsDatastore} from 'datastore-fs'
import { MemoryBlockstore } from 'blockstore-core'
import { MemoryDatastore } from 'datastore-core'

const inMemory = process.env.IN_MEMORY

export class GlobalService {
  static globalVar: Record<`0x${string}`, MessageRecord[]> = {};
  static blockstore = inMemory ? new MemoryBlockstore() : new FsBlockstore('../data/blockstore');
  static datastore = inMemory ? new MemoryDatastore() :new FsDatastore('../data/datastore')
}
