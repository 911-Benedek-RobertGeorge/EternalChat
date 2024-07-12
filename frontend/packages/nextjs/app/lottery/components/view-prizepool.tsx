/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { abi as lotteryAbi } from "../../../abi/Lottery.json";
import { formatEther, hexToBigInt, hexToString, parseEther, toHex } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

export function ViewPrizePool({ address, reRenderLotteryState }: { address: string, reRenderLotteryState: () => void }) {
  const [prizePool, setPrizePool] = useState<bigint | null>(null);
  const [error, setError] = useState<String | null>(null);
  const client = usePublicClient();

  const handlePrizepool = async () => {
    console.log(`View total prize pool`);
    const prizePool = await client
      ?.readContract({
        abi: lotteryAbi,
        address: address,
        functionName: "prizePool",
        args: [],
      })
      .catch((e: Error) => {
        console.log("ERROR occured : ", e.message);
        setError(e.message);
      }) as bigint;

    setPrizePool(prizePool);
    setError(null)
    reRenderLotteryState();
    console.log(prizePool);
  };

  let parsedPrizePool;
  if (prizePool) {
    parsedPrizePool = formatEther(prizePool)
  }


  return (
    <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
      <div className="card-body">
        <h2 className="card-title">{"View Prizepool"}</h2>
      </div>
      {!prizePool && (
        <button className="btn btn-active btn-neutral" disabled={false} onClick={handlePrizepool}>
          Get prize pool
        </button>
      )}
      {parsedPrizePool && (
        <label className="label flex flex-col">
          <span className="label-text">Total Prize pool: {parsedPrizePool} Tokens</span>
        </label>
      )}
      {
        error && (
          <label className="label flex flex-col">
            <span className="label-text">Error: {error}</span>
          </label>
        )
      }
    </div>
  );
}
