import { createHelia } from 'helia'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'
import { useEffect, useState } from "react";

 
export function UploadToIpfsButton({messagesJsonFormat, userAddress}: { messagesJsonFormat: any , userAddress: string})   {

const [cid, setCid] = useState<CID | null>(null)

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
    const pinnedContent = await helia.pins.ls({cid});
    const isPinned = await helia.pins.isPinned(cid);
    console.log("pinned content" ,pinnedContent);  
    console.log("isPinned", isPinned);
    setCid(cid);
    const obj = await j.get(cid)
    
    await helia.stop() ;
    console.info(obj)
  }

//   useEffect(() => {
//     loadIPFS()
//   }, [])  

return (    
    <div> 
    
    <button className='btn glass ' onClick={loadIPFS}> Upload messages to IPFS</button>
    {cid && <div> Uploaded to IPFS with CID: {cid.toString()}</div>}
    </div>


)

}