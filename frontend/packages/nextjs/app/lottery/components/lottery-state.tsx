import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { abi as lotteryAbi } from "~~/abi/Lottery.json";

interface LotteryContractData {
  betsOpen: boolean;
  betsClosingTime: Date;
  prizePool: bigint;
  ownerPool: bigint;
}

export function LotteryState({ address, shouldReRender }: { address: string, shouldReRender: number }) {
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<LotteryContractData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const client = usePublicClient();

  useEffect(() => {
    const fetchContractData = async () => {
      setIsLoading(true);
      try {
        const [betsOpenResult, betsClosingTimeResult, prizePoolResult, ownerPoolResult] = await Promise.all([
          client?.readContract({
            abi: lotteryAbi,
            address: address,
            functionName: "betsOpen",
          }),
          client?.readContract({
            abi: lotteryAbi,
            address: address,
            functionName: "betsClosingTime",
          }),
          client?.readContract({
            abi: lotteryAbi,
            address: address,
            functionName: "prizePool",
          }),
          client?.readContract({
            abi: lotteryAbi,
            address: address,
            functionName: "ownerPool",
          }),
        ]);
        console.log([betsOpenResult, betsClosingTimeResult, prizePoolResult, ownerPoolResult]);

        setContractData({
          betsOpen: typeof betsOpenResult === 'boolean' ? betsOpenResult : false,
          betsClosingTime: typeof betsClosingTimeResult === 'bigint' ? new Date(Number(betsClosingTimeResult * 1000n)) : new Date(),
          prizePool: typeof prizePoolResult === 'bigint' ? prizePoolResult : 0n,
          ownerPool: typeof ownerPoolResult === 'bigint' ? ownerPoolResult : 0n,
        });
      } catch (error) {
        setError("Error fetching contract data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();
  }, [client, address, shouldReRender]);

  return (
    <div className="card w-full bg-primary text-primary-content mt-4 p-4 ">
      <div className="card-body">
        <h2 className="text-center">
          <span className="block text-2xl font-bold">Lottery State</span>
        </h2>
        {isLoading ? (
          <p>Loading lottery data...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : contractData ? (
          <div>
            <p>Bets Open: {contractData.betsOpen.toString()}</p>
            <p>Bets Closing Time: {contractData.betsClosingTime.toString()}</p>
            <p>Prize Pool: {formatEther(contractData.prizePool)}</p>
            <p>Owner Pool: {formatEther(contractData.ownerPool)}</p>
          </div>
        ) : (
          <p>No data available yet.</p>
        )}
      </div>
    </div>
  );
}