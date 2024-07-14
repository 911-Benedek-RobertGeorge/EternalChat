"use client"

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import useReRender from "~~/hooks/useReRender";
import { fetchConversations, fetchMessages } from "./services/conversationService";
import { Conversation, Message } from "./types/types";
import ChatArea from "./components/ChatArea";

const Chat: NextPage = () => {

    const account = useAccount()

    return (
        <>
            <div className="text-center mt-8 bg-secondary p-10">
                <h1 className="text-4xl my-0">Chat</h1>
                <div >
                    <Address address={account.address}/>
                    <br />
                    {account.address && <ChatArea account={account}/>}
                </div>
            </div>
        </>
    );
};

export default Chat;
