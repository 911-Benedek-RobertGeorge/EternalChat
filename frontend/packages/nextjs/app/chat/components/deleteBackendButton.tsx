import { useAccount} from "wagmi";
import { deleteConversationBackend } from '../services/postBackend';
 
export function DeleteBackend({selectedConversation, reFetchData}: { selectedConversation: string, reFetchData: ()=> void})   {
  const {address: accountAddress} = useAccount();

  if(!accountAddress){
    return <></>
  }

return (    
    <div> 
    
    <button className='btn ' onClick={() => deleteConversationBackend(accountAddress,selectedConversation).then(() => reFetchData())
    }> Delete the selected conversation (backend)</button>
    </div>


)

}