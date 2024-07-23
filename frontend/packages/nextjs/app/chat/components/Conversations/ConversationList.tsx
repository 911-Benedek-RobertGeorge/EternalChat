import React, { Dispatch, SetStateAction } from "react";
import { Avatar } from "./Avatar";
import { Conversations } from "../../types/types";
import {CreateConversation } from "./CreateConversation"
import { Address } from "~~/components/scaffold-eth";

interface ConversationListProps {
    conversations: Conversations;
    selectedConversation: string;
    onSelectConversation: (address: `0x${string}`) => void;
    setConversations: Dispatch<SetStateAction<Conversations>>;
    setSelectedConversation: Dispatch<SetStateAction<`0x${string}` | null>>;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, selectedConversation,setConversations,setSelectedConversation }) => {
    return (
<>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Last Message</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Object.entries(conversations).map(([address, messages]) => (
                            <tr className={selectedConversation == address ? "bg-base-200" : ""} key={address} onClick={() => onSelectConversation(address as `0x${string}`)}>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <Address address={address as `0x${string}`} disableAddressLink={true} size="xl"/>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {messages ? messages[messages.length - 1]?.message?.slice(0,30) : ""}{"..."}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="h-10"></div>
            <CreateConversation setConversations={setConversations} setSelectedConversation={setSelectedConversation}/>


        </>
    );
};

export default ConversationList;
