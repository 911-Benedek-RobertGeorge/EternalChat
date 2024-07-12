/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { hexToBigInt, parseEther, toHex, hexToString, formatEther } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { abi } from "../../../abi/Lottery.json"


interface BetData {
    betPrice: string,
    betFee: string,
    tokenRatio: bigint
}


export function Bet({ address, blockExplorer, reRenderLotteryState }: { address: string, blockExplorer: string, reRenderLotteryState: () => void }) {
    const [amount, setAmount] = useState("");
    const [betData, setBetData] = useState<BetData | null>(null);
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<String | null>(null);
    const handleBets = async () => {
        if (address && amount) {
            if (amount == '1') {
                console.log(`Bet ${amount} time`);
                const tx = await writeContractAsync({
                    abi,
                    address: address,
                    functionName: 'bet',
                }).catch((e: Error) => setError(e.message))
                if (tx) {
                    setResult(tx)
                    setError(null)
                    reRenderLotteryState();
                }
                console.log(`tx hash: ${tx}`)
            } else {
                console.log(`Bet ${amount} times`);
                const tx = await writeContractAsync({
                    abi,
                    address: address,
                    functionName: 'betMany',
                    args: [BigInt(amount)],
                }).catch((e: Error) => setError(e.message))
                if (tx) {
                    setResult(tx)
                    setError(null)
                    reRenderLotteryState();
                }
                console.log(`tx hash: ${tx}`)
            }

        }
    }

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [betPrice, betFee, purchaseRatio] = await Promise.all([
                    publicClient?.readContract({ abi, address: address, functionName: "betPrice" }) ?? Promise.resolve(0),
                    publicClient?.readContract({ abi, address: address, functionName: "betFee" }) ?? Promise.resolve(0),
                    publicClient?.readContract({ abi, address: address, functionName: "purchaseRatio" }) ?? Promise.resolve(0),
                ]);

                setBetData({
                    betPrice: formatEther(betPrice as bigint),
                    betFee: formatEther(betFee as bigint),
                    tokenRatio: purchaseRatio as bigint
                });
            } catch (e) {
                setError((e as Error).message);
            }

        }
        fetchData();
    }, [address])

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Bet tokens</h2>
                <>
                    <label className="label">
                        <span className="label-text">Enter the amount of time to bet</span>
                        <span className="label-text">1 ETH = {betData?.tokenRatio.toString()} tokens</span>
                        <span className="label-text"> 1 Bet = {betData?.betPrice} + {betData?.betFee} (fees) tokens</span>
                    </label>
                    <input
                        type="number"
                        placeholder="Enter the amount of times to bet"
                        className="input input-bordered w-full max-w-xs"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </>
            </div>
            {error && (<>
                <span className="label-text">Error: {error} </span>
            </>)}
            {!result && <button
                className="btn btn-active btn-neutral"
                disabled={false}
                onClick={handleBets}
            >
                Bet !
            </button>}
            {result && <label className="label flex flex-col">
                <span className="label-text">Transaction Hash: {result} </span>
                <div className="flex">
                    <a target="_blank" href={blockExplorer + result} className="label-text hover:scale-125 bg-slate-500 rounded-3xl p-2"> Check it on explorer!  </a>
                    <button
                        className="btn btn-active btn-neutral"
                        disabled={false}
                        onClick={() => setResult(null)}
                    >Bet again</button>
                </div>
            </label>
            }
        </div>
    );
}