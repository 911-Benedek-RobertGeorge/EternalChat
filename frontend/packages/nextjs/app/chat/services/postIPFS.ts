const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendToIpfs = async (accountAddress: string, conversationAddress: string, previousCid: string | null): Promise<{cid:string,newMerkleRoot:`0x${string}`, merkleRootOfAppendedData:`0x${string}`, newNumChunks:number}> => {
        const response = await fetch(`${BACKEND_URL}/pin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ownerAddress: accountAddress, otherAddress:conversationAddress, previousCid }),
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
      
        const data = await response.json();
        console.log(data);
        
        return data.result;
      }
