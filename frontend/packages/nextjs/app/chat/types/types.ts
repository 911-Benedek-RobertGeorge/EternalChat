
/* A conversation contains all the messages linked to one address; For now there is only 1 to 1 conversations*/ 
export type Conversation = ConversationMessage[]

export interface ConversationMessage{
  message: string;
  timestamp: number;
  direction:string;
  onIpfs: boolean;
}

/* A map of all the conversations */ 
export type Conversations = Record<`0x${string}`,Conversation>

/* MessageRecord: A conversation message with the information of who you talk to: done for simply storing all the messages in a list on the backend*/ 
export interface MessageRecord {
  otherAddress: `0x${string}`;
  message: string;
  timestamp: number;
  direction: string;
  
}
