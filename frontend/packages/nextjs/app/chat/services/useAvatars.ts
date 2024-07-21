import { blo } from "blo";
import { getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { Conversation, Conversations } from "../types/types";


export function useGetConversationAvatars(userAddress : `0x${string}` | undefined, conversations: Conversations){
    let avatars : {
        [address: `0x${string}`]: string;
    }= {};
    if (userAddress){
      avatars[userAddress] = blo(userAddress)
    }

    for( const key in conversations){
      const address = key as `0x${string}`
      if (!avatars[address]) {
        avatars[address] = blo(address);
      }
    }
    return avatars
}