import React from "react";
import { Avatar } from "./Conversations/Avatar";
import { Conversations } from "../types/types";

interface ConversationListProps {
    conversations: Conversations;
    selectedConversation: string;
    onSelectConversation: (address: `0x${string}`) => void;
    avatars: { [address: `0x${string}`]: string };
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, selectedConversation, avatars }) => {
    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4">
            <div className="card-body">
                <h2 className="card-title">Conversations</h2>
            </div>
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
                                        {messages ? messages[messages.length - 1].message.slice(0,30) : ""}{"..."}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>



        </div>
    );
};

export default ConversationList;
