/* eslint-disable prettier/prettier */
import { useState } from "react";
import { abi } from "../../../abi/Lottery.json";
import { hexToBigInt, hexToString, parseEther, toHex } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

export function WithdrawFromPrizepool({ address, blockExplorer, reRenderLotteryState }: { address: string; blockExplorer: string, reRenderLotteryState: () => void }) {
  const [amount, setAmount] = useState("");
  const { writeContractAsync } = useWriteContract();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<String | null>(null);

  const handleWithdrawFromPrizePool = async () => {
    if (address && amount) {
      try {
        console.log(`withdrawing from prizepool: ${amount} Tokens`);
        const tx = await writeContractAsync({
          abi,
          address: address,
          functionName: "prizeWithdraw",
          args: [amount],
        }).catch((e: Error) => {
          throw e;
        });
        setResult(tx);
        setError(null)
        reRenderLotteryState();
        console.log(`tx hash: ${tx}`);
      } catch (error) {
        if (error instanceof Error) {
          console.log("ERROR occured : ", error.message);
          setError(error.message);
        }
      }
    }
  };

  return (
    <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
      <div className="card-body">
        <h2 className="card-title">Withdraw Winnings From Prizepool</h2>
        <>
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
        </>
      </div>
      {error && (<>
        <span className="label-text">Error: {error} </span>
      </>)}
      {!result && (
        <button className="btn btn-active btn-neutral" disabled={false} onClick={handleWithdrawFromPrizePool}>
          Withdraw Winnings !
        </button>
      )}
      {result && (
        <label className="label flex flex-col">
          <span className="label-text">Transaction Hash: {result} </span>
          <a target="_blank" href={blockExplorer + result} className="label-text hover:scale-125 bg-slate-500 rounded-3xl p-2"> Check it on explorer!  </a>

        </label>
      )}
    </div>
  );
}
