import { createHelia } from 'helia'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'
import { Dispatch, SetStateAction, useEffect, useState } from "react";
 import { abi as ethernalAbi } from "../../../abi/EternalChat.json";
import { parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { sendToIpfs } from '../services/postIPFS';
 
export function UploadToIpfsButton({selectedConversation, cid, setCid}: { selectedConversation: string, cid: string | null , setCid: Dispatch<SetStateAction<string | null>>})   {
  const {address: accountAddress} = useAccount();


  if(!accountAddress){
    return <></>
  }

return (    
    <div> 
    
    <button className='btn glass ' onClick={() => sendToIpfs(accountAddress, selectedConversation, cid).then(setCid)
    }> Save selected conversation to IPFS</button>
    {cid && <div> Uploaded to IPFS with CID: {cid.toString()}</div>}
    </div>


)

}