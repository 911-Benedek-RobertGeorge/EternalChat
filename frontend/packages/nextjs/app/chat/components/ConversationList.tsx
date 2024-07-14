import React from "react";
import { Avatar } from "./Conversations/Avatar";

interface ConversationListProps {
    conversations: { address: string; lastMessage: string }[];
    selectedConversation: string;
    onSelectConversation: (address: string) => void;
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
                    {conversations.map((conversation, index) => (
                            <tr className={selectedConversation == conversation.address ? "bg-base-200" : ""} key={index} onClick={() => onSelectConversation(conversation.address)}>

                                <td>
                                    <div className="flex items-center gap-3">
                                        <Avatar avatar={avatars[conversation.address as `0x${string}`]} />
                                        <div>
                                            <div className="font-bold">{conversation.address}</div>
                                            {/* <div className="text-sm opacity-50">United States</div> */}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {conversation.lastMessage}
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
