/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { abi as lotteryAbi } from "../../../abi/Lottery.json";
import { parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
 
export function LotteryAdmin({ address }: { address: string,  }) {
   const [error, setError] = useState<String | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);   
  const { writeContractAsync } = useWriteContract();

  const client = usePublicClient();
  const account = useAccount();
  const [selectedDate, setSelectedDate] = useState<Date | null>();
  const [amount, setAmount] = useState<string>("");
const transformDateToTimestamp = () => {
    const timestamp = selectedDate ? Math.floor(selectedDate.getTime() / 1000) : 0;     
      console.log(timestamp);

  return BigInt(timestamp);
};

 useEffect(() => {  
    const checkOwner = async () => {
      console.log(`Checking if owner`);
      const owner = await client
        ?.readContract({
          abi: lotteryAbi,
          address: address,
          functionName: "owner",
          args: [],
        })
        .catch((e: Error) => {
          console.log("ERROR occured getting the owner : ", e.message);
          setError(e.message);
        }) as string;
      console.log("THE OWNER IS : ", owner);
      setIsOwner(owner === account.address);
      setError(null);
    };
    checkOwner();
  }
    , [client, address]);


  const openBets = async () => {
    console.log(`open the bets`);
    const tx = await writeContractAsync({ 
      abi: lotteryAbi,
      address: address,
      functionName: 'openBets',
      args: [transformDateToTimestamp()],
      })
      .catch((e: Error) => {
        console.log("ERROR occured : ", e.message);
        setError(e.message);
      })
      console.log(`tx hash: ${tx}`);  
     setError(null)
     
   };
   const withdrawFees = async () => {
    console.log(`withdraw the fees`);
    const tx = await writeContractAsync({
      abi: lotteryAbi,
      address: address,
      functionName: 'ownerWithdraw',
      args: [parseEther(amount)],
      })
      .catch((e: Error) => {
        console.log("ERROR occured : ", e.message);
        setError(e.message);
      })
      console.log(`tx hash: ${tx}`);  
     setError(null)
     
   };
  


  return (
     isOwner ? <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
      <h1 className="card-title text-3xl mb-16 ">Admin pannel</h1>
      <div className="flex flex-row gap-16"> 
               <div className="flex flex-col">
 <h2 className="card-title">{"Open Bets"}</h2>
            <label className="label flex flex-col items-start">
                Select a date:
                <input
                    type="date"
                    value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
            </label>
    
        <button className="btn btn-active btn-neutral max-w-64"  onClick={openBets}>
          Open Bets
        </button>    
            </div>

        <div className="flex flex-col gap-4"> 
        <h2 className="card-title ">Withdraw Tokens</h2>
               
                    <label className="label">
                        <span className="label-text">Enter the amount to withdraw</span>
                    </label>
                    <input
                        type="number"
                        placeholder="Enter the amount to withdraw"
                        className="input input-bordered w-full max-w-xs"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
          <button className="btn btn-active btn-neutral max-w-64"  onClick={withdrawFees}>
          Withdraw
        </button></div>
        </div> 
      {
        error && (
          <label className="label flex flex-col">
            <span className="label-text">Error: {error}</span>
          </label>
        )
      }
    </div> : <> </>
  );
}
