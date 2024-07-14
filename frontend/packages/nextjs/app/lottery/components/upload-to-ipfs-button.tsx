import { createHelia } from 'helia'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'
import { useEffect, useState } from "react";
 import { abi as ethernalAbi } from "../../../abi/EternalChat.json";
import { parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
 
export function UploadToIpfsButton({messagesJsonFormat, userAddress, contractAddress}: { messagesJsonFormat: any , userAddress: string, contractAddress:string})   {

const [cid, setCid] = useState<CID | null>(null)
const { writeContractAsync } = useWriteContract();
const [error, setError] = useState<String | null>(null);

async function loadIPFS() {
    const helia = await createHelia(); 
    await helia.start();

    const j = json(helia)
     const cid = await j.add( 
        messagesJsonFormat
     )

    const result = await helia.pins.add(cid, {depth: 100});
    console.log("the rez of the pining "    , result)
     console.log("content pinned with CID", cid.toString())
 
    setCid(cid);
    const obj = await j.get(cid)
    
    await helia.stop() ;
    console.info(obj)
  }

  const setCID = async () => {
    console.log(`set the cid for the user`);
    const tx = await writeContractAsync({ 
      abi: ethernalAbi,
      address: contractAddress as `0x${string}`,
      functionName: 'addCID',
      args: [cid!.toString()],
      })
      .catch((e: Error) => {
        console.log("ERROR occured : ", e.message);
        setError(e.message);
      })
      console.log(`tx hash: ${tx}`);  
     setError(null)
     
   };

  useEffect(() => {
    setCID();
  }, [cid])  

return (    
    <div> 
    
    <button className='btn glass ' onClick={loadIPFS}> Upload messages to IPFS</button>
    {cid && <div> Uploaded to IPFS with CID: {cid.toString()}</div>}
    </div>


)

}