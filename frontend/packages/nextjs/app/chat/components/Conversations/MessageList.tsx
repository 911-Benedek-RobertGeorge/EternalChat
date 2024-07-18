import React, { useEffect } from "react";
import { Conversation, MessageRecord } from "../../types/types";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from "viem/ens";
import { Address, getAddress, isAddress } from "viem";
import { blo } from "blo";
import { SendMessage } from "./SendMessage";

interface MessageListProps {
    address:  `0x${string}`;
    messages: Conversation;
    avatars : {[address: `0x${string}`] : string};
    reFetchData: () => void;
}

const MessageList: React.FC<MessageListProps> = ({address, messages, avatars, reFetchData }) => {
    const { address: accAddress } = useAccount()    

    if(!accAddress){
        return <></>
    }

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Messages</h2>
            </div>
            {messages.map((message, index) => (
                    <div key={index} className={`chat ${message.direction == 'outgoing' ? "chat-end" : "chat-start"}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS chat bubble component"
                                    src={avatars[address]} />
                            </div>
                        </div>
                        <div className="chat-header">
                            {message.direction == 'outgoing' ? accAddress: address  }{" "}
                            <time className="text-xs opacity-50">{new Date(message.timestamp).toLocaleString()}</time>
                        </div>
                        <div className={`chat-bubble ${ message.direction == 'outgoing' && "chat-bubble-secondary"}`}>{message.message}</div>
                        <div className="chat-footer opacity-50">Delivered</div>
                    </div>
            ))}
            <div className="h-5"></div>
            <SendMessage address={address} reFetchData={reFetchData}/>
        </div>
    );
};

export default MessageList;