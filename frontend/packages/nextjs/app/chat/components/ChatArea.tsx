import { useEffect, useState } from "react";
import { Config, UseAccountReturnType } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import useReRender from "~~/hooks/useReRender";
import { fetchMessagesBackend, getConversations } from "../services/fetchBackend";
import { Conversation, Conversations, MessageRecord } from "../types/types";
import ConversationList from "./Conversations/ConversationList";
import MessageList from "./Conversations/MessageList";
import { useGetConversationAvatars } from "../services/useAvatars";
import {NoConversationSelected} from "./Conversations/NoConversationSelected"


const ChatArea = ({ account }: { account: UseAccountReturnType<Config> }) => {
    const [address, setAdress] = useState("");
    const { reRender: reFetchData, count: shouldReRender } = useReRender();

    const { targetNetwork } = useTargetNetwork();
    const [conversations, setConversations] = useState<Conversations>({});
    const [messages, setMessages] = useState<Conversation>([]);
    const [selectedConversation, setSelectedConversation] = useState<`0x${string}` | null>(null);
    const avatars = useGetConversationAvatars(account.address,conversations);

    useEffect(() => {
        if (account.address) {
            fetchMessagesBackend(account.address).then(getConversations).then((conversation) => {
                setConversations(conversation);
                if(selectedConversation){
                    setMessages(conversation[selectedConversation]);
                }
            });
        }
    }, [account,shouldReRender]);

    const handleSelectConversation = (address: `0x${string}`) => {
        setSelectedConversation(address);
        setMessages(conversations[address]);
    };

    return (
        <>
            <div className="content-container flex w-full h-full">
                <div className="conversation-list flex-1 basis-1/3 p-4 m-2">
                <>
                    <ConversationList setConversations={setConversations} setSelectedConversation={setSelectedConversation} avatars={avatars} conversations={conversations} onSelectConversation={handleSelectConversation} selectedConversation={selectedConversation || ''} />
                    </>
                </div>
                <div className={`message-list flex-1 basis-2/3 p-4 m-2 ${!selectedConversation ? 'empty' : ''}`}>
                    {selectedConversation && messages ? (
                        <MessageList address={selectedConversation} messages={messages} avatars={avatars} reFetchData={reFetchData}/>
                    ) : (
                        <NoConversationSelected/>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatArea;
