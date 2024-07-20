import { Dispatch, SetStateAction, useState } from "react";
import { Conversations } from "../../types/types";

interface Props{
    setConversations: Dispatch<SetStateAction<Conversations>>;
    setSelectedConversation: Dispatch<SetStateAction<`0x${string}` | null>>;
}


export const CreateConversation = ({setConversations,setSelectedConversation}: Props) => {
    const [address, setAddress] = useState<string>("")
    const [error, setError] = useState<string|null>(null)

    const checkSetAddress = (address: string) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setError("Invalid address");
        }
        else {
            setConversations((oldConversations) => { 
                let newConversations = {...oldConversations}; 

                if(!newConversations[address as `0x${string}`]){
                    newConversations[address as `0x${string}`] = []
                }
                else {
                    console.log(address);
                    
                    setSelectedConversation(address as `0x${string}`)
                }
                return newConversations
            })
        }

    }
    return (<>
<div className="flex justify-center items-center h-full text-xl text-gray-500 gap-4">

        <input
            type="text"
            placeholder="0x707e39cefede2c48a82b64b14347820011852146"
            className="input input-bordered w-full "
            value={address}
            onChange={e => {setAddress(e.target.value) ; if(error){setError(null)}}}
        />
        <button
            className="btn btn-active btn-neutral"
            disabled={false}
            onClick={()=> {checkSetAddress(address); setAddress("")}}
        >
            Create a conversation
        </button>
        </div>
        {error &&         
            <p className="text-error">{error}</p>}
        </>)
}