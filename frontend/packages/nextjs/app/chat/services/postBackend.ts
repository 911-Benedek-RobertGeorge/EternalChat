
import { Conversation, Conversations, MessageRecord } from "../types/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const postMessagesBackend = async (messageRecord: MessageRecord, accountAddress:  string) => {
    const response = await fetch(`${BACKEND_URL}/store-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...messageRecord, ownerAddress: accountAddress}),
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
  
    const data = await response.json();
    return data.result;
  }