/* eslint-disable prettier/prettier */
import { useState } from "react";
import { hexToBigInt, parseEther, toHex, hexToString } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { abi } from "../../../abi/Lottery.json"



export function CloseLottery({ address, blockExplorer, reRenderLotteryState }: { address: string, blockExplorer: string, reRenderLotteryState: () => void }) {
    const { writeContractAsync } = useWriteContract();
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<String | null>(null);
    const handleBets = async () => {
        if (address) {

            console.log("Close the lottery");
            const tx = await writeContractAsync({
                abi,
                address: address,
                functionName: 'closeLottery',
            }).catch((e: Error) => setError(e.message))
            if (tx) {
                setResult(tx)
                setError(null)
                reRenderLotteryState();
            }
            console.log(`tx hash: ${tx}`)


        }
    }

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Close the lottery</h2>
            </div>
            {error && (<>
                <span className="label-text">Error: {error} </span>
            </>)}
            {!result && <button
                className="btn btn-active btn-neutral"
                disabled={false}
                onClick={handleBets}
            >
                Close the lottery !
            </button>}
            {result && <label className="label flex flex-col">
                <span className="label-text">Transaction Hash: {result} </span>
                <div className="flex">
                    <a target="_blank" href={blockExplorer + result} className="label-text hover:scale-125 bg-slate-500 rounded-3xl p-2"> Check it on explorer!  </a>
                </div>
            </label>
            }
        </div>
    );
}