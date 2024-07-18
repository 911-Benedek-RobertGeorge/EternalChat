"use client"

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Config, useAccount, UseAccountReturnType, useEnsAvatar, useEnsName } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import useReRender from "~~/hooks/useReRender";
import { fetchConversations, fetchMessages } from "../services/fetchBackend";
import { Conversation, Message } from "../types/types";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import { useGetConversationAvatars } from "../services/useAvatars";
import { generateKey } from "crypto";


const ChatArea = ({ account }: { account: UseAccountReturnType<Config> }) => {
    const [address, setAdress] = useState("");
    const { reRender: reRenderLotteryState, count: shouldReRender } = useReRender();

    const { targetNetwork } = useTargetNetwork();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const avatars = useGetConversationAvatars(account.address,conversations);

    useEffect(() => {
        if (account.address) {
            fetchConversations(account.address).then(setConversations);
        }
    }, [account]);

    const handleSelectConversation = (address: string) => {
        setSelectedConversation(address);
        fetchMessages(address).then(setMessages);
    };

    return (
        <>
            <div className="content-container flex w-full h-full">
                <div className="conversation-list flex-1 basis-1/3 p-4 m-2">
                    <ConversationList  avatars={avatars} conversations={conversations} onSelectConversation={handleSelectConversation} selectedConversation={selectedConversation || ''} />
                </div>
                <div className={`message-list flex-1 basis-2/3 p-4 m-2 ${!selectedConversation ? 'empty' : ''}`}>
                    {selectedConversation ? (
                        <MessageList messages={messages} avatars={avatars}/>
                    ) : (
                        <div className="flex justify-center items-center h-full text-xl text-gray-500">
                            Select a conversation or create a new one
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatArea;
