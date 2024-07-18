// import { Conversation, MessageRecord } from "../types/types";

// export const fetchConversations = async (account: string): Promise<Conversation[]> => {
//     // Replace with your backend URL
//     // const response = await fetch(`https://your-backend-url.com/conversations?account=${account}`);
//     // return response.json();

//     return [{address:"0xC6CbDd7D90458c5e1003DdE243bF1561efAeE516",lastMessage:"Convo1"},{address:"0xacB1B8FFe4Dc0b8a16a7204536d0609D88f32323",lastMessage:"Convo2"}]
//   };
  
//   export const fetchMessages = async (address: string): Promise<Message[]> => {
//     // Replace with your backend URL
//     // const response = await fetch(`https://your-backend-url.com/messages?address=${address}`);
//     // return response.json();
//     if(address == "0xC6CbDd7D90458c5e1003DdE243bF1561efAeE516" ){
//     return [{sender:"0xC6CbDd7D90458c5e1003DdE243bF1561efAeE516",content:"Message1"},{sender:"0xacB1B8FFe4Dc0b8a16a7204536d0609D88f32323",content:"Message2"}]
//     } else {
//         return [{sender:"0xacB1B8FFe4Dc0b8a16a7204536d0609D88f32323",content:"Message1"},{sender:"0xacB1B8FFe4Dc0b8a16a7204536d0609D88f32323",content:"Message2"}]
//     }
//   };