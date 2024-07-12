/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { abi as lotteryAbi } from "../../../abi/Lottery.json";
import { formatEther, hexToBigInt, hexToString, parseEther, toHex } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

export function CheckWinnings({
  address,
  reRenderLotteryState,
}: {
  address: string;
  reRenderLotteryState: () => void;
}) {
  const [winnings, setWinnings] = useState<string | null>("");
  const [error, setError] = useState<String | null>(null);
  const client = usePublicClient();
  const { address: connectedAddress } = useAccount();

  const handleCheckWinnings = async () => {
    console.log(`View total winnings pool`);
    const winningsFromContract = (await client
      ?.readContract({
        abi: lotteryAbi,
        address: address,
        functionName: "prize",
        args: [connectedAddress],
      })
      .catch((e: Error) => {
        console.log("ERROR occured : ", e.message);
        setError(e.message);
      })) as bigint;
    if (winningsFromContract == 0n) {
      setWinnings("0");
    } 
      setWinnings(`${winningsFromContract}`);
      setError(null);
      reRenderLotteryState();
      console.log(winnings);
    
  };


  return (
    <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
      <div className="card-body">
        <h2 className="card-title">{"View Winnings"}</h2>
      </div>

      <button className="btn btn-active btn-neutral" disabled={false} onClick={handleCheckWinnings}>
        Check Winnings !
      </button>

      {winnings && (
        <label className="label flex flex-col">
          <span className="label-text">Total winnings from Prize pool: {formatEther(`${winnings}` as any)} Tokens</span>
        </label>
      )}
      {error && (
        <label className="label flex flex-col">
          <span className="label-text">Error: {error}</span>
        </label>
      )}
    </div>
  );
}
