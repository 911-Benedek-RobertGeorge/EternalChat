import { createHelia } from 'helia'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {abi as ethernalAbi} from '../../../abi/EthernalChatIncentivized.json'
import { parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { sendToIpfs } from '../services/postIPFS';
import { getBlockExplorerTxLink } from '~~/utils/scaffold-eth';
import { getChainFromEnv } from '~~/utils/getChain';
 
export function UploadToIpfsButton({selectedConversation, cid, setCid, contractAddress, chunkSize}: { contractAddress:string, selectedConversation: string, cid: string | null , setCid: Dispatch<SetStateAction<string | null>>, chunkSize:number})   {
  const {address: accountAddress} = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const network = getChainFromEnv();
  const debugMode = process.env.NEXT_PUBLIC_CHAIN_ENV == "hardhat"
  let blockExplorer = "";
  if (debugMode && tx) blockExplorer = `http://localhost:3001/blockexplorer/transaction/${tx}`
  else if(tx){
    blockExplorer = getBlockExplorerTxLink(network.id, tx);
  }


  const handleSendToContract= async (newCid: string,newMerkleRoot:`0x${string}`, merkleRootOfAppendedData:`0x${string}`, newNumChunks:number,chunkSize:number) => {
    if(newCid != cid){
    const cidObj = CID.parse(newCid);    
    const cidBytes = cidObj.multihash.bytes.slice(2);

    if (cidBytes.length !== 32) {
        throw new Error('Invalid Cid');
    }
    const hexString = toHex(cidBytes);

    writeContractAsync({ 
        abi: ethernalAbi,
        address: contractAddress as `0x${string}`,
        functionName: 'setCID',
        args: [hexString,newNumChunks, chunkSize, newMerkleRoot, merkleRootOfAppendedData],
        })
        .catch((e: Error) => {
            console.log("ERROR occured : ", e.message);
            setError(e.message);
        }).then((tx) => {
            setTx(tx ? tx : null);
            console.log(`tx hash: ${tx}`);  
        setError(null)})
        }
  }


  if(!accountAddress){
    return <></>
  }

return (    
    <div> 
    
    <button className='btn glass ' onClick={() => sendToIpfs(accountAddress, selectedConversation, cid).then(({cid:newCid,newMerkleRoot, merkleRootOfAppendedData, newNumChunks}) => {setCid(newCid); if(newCid){handleSendToContract(newCid,newMerkleRoot, merkleRootOfAppendedData, newNumChunks, chunkSize);}})
    }> Save selected conversation to IPFS</button>
    {cid && <div> Uploaded to IPFS with CID: {cid.toString()}</div>}
    {tx && <label className="label flex flex-col">
                <span className="label-text">Transaction Hash: {tx} </span>
                <a target="_blank" href={blockExplorer} className="label-text hover:scale-125 bg-slate-500 rounded-3xl p-2"> Check it on explorer!  </a>
            </label>}
    {error && <p className='text-red'>{error}</p>}
    </div>


)

}