import { Conversation, Conversations, MessageRecord } from "../types/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchMessagesIPFS = async (cid: string | null): Promise<MessageRecord[]> => {

    if (cid == null) {
        return [];
    }

    const response = await fetch(`${BACKEND_URL}/get-from-cid?cid=${cid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    console.log("data",data);
    
    if (!data.result) {
        return []
    }

    return JSON.parse(data.result);
};

export function mergeIpfs(data: Conversations, ipfsData: Conversations): Conversations {
    console.log(ipfsData);

    for (const key in data) {
        for (const message of data[key as `0x${string}`]) {
            if (!ipfsData[key as `0x${string}`]) {
                ipfsData[key as `0x${string}`] = [];
            }
            const exists = ipfsData[key as `0x${string}`].some((item) => JSON.stringify({...item,onIpfs:message.onIpfs}) === JSON.stringify(message));
            if (!exists) {
                ipfsData[key as `0x${string}`].push(message);
            }

            ipfsData[key as `0x${string}`].sort((m1, m2) => m1.timestamp - m2.timestamp);
        }

    }

    return ipfsData;
}