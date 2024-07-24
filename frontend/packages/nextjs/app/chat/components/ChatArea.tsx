import { useEffect, useState } from "react";
import { Config, useAccount, UseAccountReturnType, usePublicClient, useWriteContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import useReRender from "~~/hooks/useReRender";
import { fetchMessagesBackend, getConversations } from "../services/fetchBackend";
import { Conversation, Conversations, MessageRecord } from "../types/types";
import ConversationList from "./Conversations/ConversationList";
import MessageList from "./Conversations/MessageList";
import { useGetConversationAvatars } from "../services/useAvatars";
import { NoConversationSelected } from "./Conversations/NoConversationSelected"
import { UploadToIpfsButton } from "./upload-to-ipfs-button";
import { DeleteBackend } from "./deleteBackendButton";
import { fetchMessagesIPFS, mergeIpfs } from "../services/fetchIPFS";
import {abi as ethernalAbi} from '../../../abi/EthernalChat.json'
import {CID} from "multiformats"
import * as jsonCodec from 'multiformats/codecs/json'
import { fromHex, hexToBytes, toHex } from "viem";

const ChatArea = ({ account }: { account: UseAccountReturnType<Config> }) => {
    const [address, setAdress] = useState("");
    const { reRender: reFetchData, count: shouldReRender } = useReRender();
    const { targetNetwork } = useTargetNetwork();
    const [conversations, setConversations] = useState<Conversations>({});
    const [messages, setMessages] = useState<Conversation>([]);
    const [selectedConversation, setSelectedConversation] = useState<`0x${string}` | null>(null);
    const avatars = useGetConversationAvatars(account.address, conversations);
    const [cid, setCid] = useState<string | null>(null)

    const publicClient = usePublicClient();


    useEffect(() => {       
        if (account.address) {
            Promise.all([fetchMessagesBackend(account.address),fetchMessagesIPFS(cid)])
            .then(([backendMess,ipfsMess]) => mergeIpfs(getConversations((backendMess)),getConversations(ipfsMess,true)))
            .then((conversation) => {
                setConversations(conversation);
                if (selectedConversation) {
                    setMessages(conversation[selectedConversation]);
                }
            });
        }
    }, [account,cid, shouldReRender]);

    const handleSelectConversation = (address: `0x${string}`) => {
        setSelectedConversation(address);
        setMessages(conversations[address]);
    };


    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
    useEffect(() => {
     if(publicClient) {
            publicClient.readContract(
                {
                    abi:ethernalAbi,
                    address: contractAddress,
                    functionName:"getCID",
                    args:[account.address]
                }
            ).then((res) => {
                const bytes = fromHex(res as `0x${string}`,{
                    size: 32,
                    to: 'bytes'
                  });
                  
                  if(!bytes.every(byte => byte === 0)){
                    const prefix  = Buffer.from([18, 32]);
                    const resultBuffer = Buffer.concat([prefix, Buffer.from(bytes)]);
                    const _newCid = CID.decode(resultBuffer);
                    const newCid = CID.createV1(jsonCodec.code,_newCid.multihash);                  
                    setCid(newCid.toString());       
                }           
                
            }
            )
        }


    }, [])  


    if (!account.address) {
        return <></>
    }

    return (
        <>
            <div className="content-container flex w-full h-full">

                <div className="conversation-list flex-1 basis-1/3 p-4 m-2">
                    <div className="card w-full  bg-primary text-primary-content mt-4 p-4">
                        <div className="card-body">
                            <h2 className="card-title">Conversations</h2>
                        </div>
                        <ConversationList setConversations={setConversations} setSelectedConversation={setSelectedConversation} conversations={conversations} onSelectConversation={handleSelectConversation} selectedConversation={selectedConversation || ''} />
                        <div className="h-10"></div>
                        {selectedConversation && messages?.length != 0 &&
                            <div>
                                <UploadToIpfsButton cid={cid} setCid={setCid} selectedConversation={selectedConversation} contractAddress={contractAddress}/>
                                <div className="h-4"></div>
                                <DeleteBackend selectedConversation={selectedConversation} reFetchData={reFetchData}/>
                            </div>
                        }
                    </div>
                </div>
                <div className={`message-list flex-1 basis-2/3 p-4 m-2 ${!selectedConversation ? 'empty' : ''}`}>
                    {selectedConversation && messages ? (
                        <MessageList address={selectedConversation} messages={messages} avatars={avatars} reFetchData={reFetchData} />
                    ) : (
                        <NoConversationSelected />
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatArea;
