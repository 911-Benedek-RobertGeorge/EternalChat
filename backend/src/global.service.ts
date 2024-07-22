export interface MessageRecord {
  otherAddress: string;
  message: string;
  timestamp: number;
  direction: string;
}
import { S3 } from '@aws-sdk/client-s3'
import { FsBlockstore } from 'blockstore-fs'
import { S3Blockstore } from 'blockstore-s3'
import { FsDatastore } from 'datastore-fs'
import { S3Datastore } from 'datastore-s3'

const s3Id = process.env.AWS_S3
const s3Secret = process.env.AWS_S3_SECRET
const s3 = new S3({
  region: 'us-east-1',
  credentials: {
    accessKeyId: s3Id || "",
    secretAccessKey: s3Secret || ""
  }
})

export class GlobalService {
  static globalVar: Record<`0x${string}`, MessageRecord[]> = {};
  static blockstore = s3Id ? new S3Blockstore(
    s3,
    'ipfs-ethernal-chat',
    { createIfMissing: false }
  ) : new FsBlockstore('./data/blockstore');
  static datastore = s3Id ? new S3Datastore(
    s3,
    'ipfs-ethernal-chat',
    { path: '.ipfs/datastore', createIfMissing: false }
  ) : new FsDatastore('./data/datastore')
}
