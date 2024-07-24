const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendToIpfs = async (accountAddress: string, conversationAddress: string, previousCid: string | null, chunkSize: number): Promise<{cid: string, merkleRoot: string, numOfChunks : number}> => {
        const response = await fetch(`${BACKEND_URL}/pin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ownerAddress: accountAddress, otherAddress:conversationAddress, previousCid, chunkSize }),
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
      
        const data = await response.json();
        console.log(data);
        
        return data.result;
      }
