import { blo } from "blo";
import { getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { Conversation } from "../types/types";


function useGetAvatar(conversationAddress :`0x${string}`){
    // const checkSumAddress = getAddress(conversationAddress as `0x${string})`);

    // const { data: fetchedEns } = useEnsName({
    //     address: checkSumAddress,
    //     chainId: 1,
    //     query: {
    //         enabled: isAddress(checkSumAddress ?? ""),
    //     },
    // });
    // const { data: fetchedEnsAvatar } = useEnsAvatar({
    //     name: fetchedEns ? normalize(fetchedEns) : undefined,
    //     chainId: 1,
    //     query: {
    //         enabled: Boolean(fetchedEns),
    //         gcTime: 30_000,
    //     },
    // });

    // const avatar = fetchedEnsAvatar || blo(conversationAddress as `0x${string}`);

    return blo(conversationAddress as `0x${string}`)
}


export function useGetConversationAvatars(userAddress : `0x${string}` | undefined, conversations: Conversation[]){
    let avatars : {
        [address: `0x${string}`]: string;
    }= {};
    if (userAddress){
      avatars[userAddress] = useGetAvatar(userAddress)
    }
    conversations.forEach(conversation => {
      const address = conversation.address as `0x${string}`;
      if (!avatars[address]) {
        avatars[address] = useGetAvatar(address);
      }
    });

    return avatars
}