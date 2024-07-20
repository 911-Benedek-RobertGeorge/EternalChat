import React, { Dispatch, SetStateAction } from "react";
import { Avatar } from "./Avatar";
import { Conversations } from "../../types/types";
import {CreateConversation } from "./CreateConversation"

interface ConversationListProps {
    conversations: Conversations;
    selectedConversation: string;
    onSelectConversation: (address: `0x${string}`) => void;
    avatars: { [address: `0x${string}`]: string };
    setConversations: Dispatch<SetStateAction<Conversations>>;
    setSelectedConversation: Dispatch<SetStateAction<`0x${string}` | null>>;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, selectedConversation, avatars,setConversations,setSelectedConversation }) => {
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
                                        <Avatar avatar={avatars[address as `0x${string}`]} />
                                        <div>
                                            <div className="font-bold">{address}</div>
                                            {/* <div className="text-sm opacity-50">United States</div> */}
                                        </div>
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
