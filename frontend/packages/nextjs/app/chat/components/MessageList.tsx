import React from "react";
import { Conversation, MessageRecord } from "../types/types";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { normalize } from "viem/ens";
import { Address, getAddress, isAddress } from "viem";
import { blo } from "blo";

interface MessageListProps {
    address:  `0x${string}`;
    messages: Conversation;
    avatars : {[address: `0x${string}`] : string};
}

const MessageList: React.FC<MessageListProps> = ({address, messages, avatars }) => {
    const { address: accAddress } = useAccount()    

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Messages</h2>
            </div>
            {messages.map((message, index) => (
                    <div key={index} className={`chat ${message.direction == 'incoming' ? "chat-end" : "chat-start"}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Tailwind CSS chat bubble component"
                                    src={avatars[address]} />
                            </div>
                        </div>
                        <div className="chat-header">
                            {message.direction == 'incoming' ? address : accAddress}{" "}
                            <time className="text-xs opacity-50">12:45</time>
                        </div>
                        <div className={`chat-bubble ${ message.direction == 'incoming' && "chat-bubble-secondary"}`}>{message.message}</div>
                        <div className="chat-footer opacity-50">Delivered</div>
                    </div>
            ))}
        </div>
    );
};

export default MessageList;