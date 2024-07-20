import { Conversation, Conversations, MessageRecord } from "../types/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchMessagesBackend = async (address: string): Promise<MessageRecord[]> => {

      const response = await fetch(`${BACKEND_URL}/stored-message?address=${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
    
      const data = await response.json();
      if(!data.result){
        return []
      }
      
      return JSON.parse(data.result);
  };


export function getConversations(messages: MessageRecord[],onIpfs?: boolean): Conversations{

  let conversations : Conversations = {}
  if(!onIpfs){
    onIpfs= false
  }

  for(const message of messages){

    const address = message.otherAddress;

    if(!conversations[address]){
      conversations[address] = [];
    }

    conversations[address].push({
      ...message, onIpfs
    })
  }

  return conversations;

}