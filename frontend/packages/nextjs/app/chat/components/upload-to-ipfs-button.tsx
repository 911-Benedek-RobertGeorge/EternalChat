import { createHelia } from 'helia'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'
import { Dispatch, SetStateAction, useEffect, useState } from "react";
 import { abi as ethernalAbi } from "../../../abi/EternalChat.json";
import { parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { getCidContract } from '../services/callContract';
import { sendToIpfs } from '../services/postIPFS';
 
export function UploadToIpfsButton({selectedConversation, cid, setCid}: { selectedConversation: string, cid: string | null , setCid: Dispatch<SetStateAction<string | null>>})   {
  const {address: accountAddress} = useAccount();

// const { writeContractAsync } = useWriteContract();
// const [error, setError] = useState<String | null>(null);

  // const setCID = async () => {
  //   console.log(`set the cid for the user`);
  //   const tx = await writeContractAsync({ 
  //     abi: ethernalAbi,
  //     address: contractAddress as `0x${string}`,
  //     functionName: 'addCID',
  //     args: [cid!.toString()],
  //     })
  //     .catch((e: Error) => {
  //       console.log("ERROR occured : ", e.message);
  //       setError(e.message);
  //     })
  //     console.log(`tx hash: ${tx}`);  
  //    setError(null)
     
  //  };

  // useEffect(() => {
  //   getCidContract().then(setCid)

  // }, [cid])  



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