/* eslint-disable prettier/prettier */
import { useState } from "react";
import { hexToBigInt, parseEther, toHex, hexToString } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { abi } from "../../../abi/Lottery.json"



export function RedeemTokens({ address, blockExplorer }: { address: string, blockExplorer: string }) {
    const [amount, setAmount] = useState("");
    const { writeContractAsync } = useWriteContract();
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<String | null>(null);


    const handleReturnTokens = async () => {
        if (address && amount) {
            try {
                console.log(`Returning tokens for: ${amount} Tokens`);
                const tx = await writeContractAsync({
                    abi,
                    address: address,
                    functionName: 'returnTokens',
                    args: [parseEther(amount)],
                }).catch((e: Error) => { throw e })
                setResult(tx)
                setError(null)
                console.log(`tx hash: ${tx}`)
            } catch (error) {
                if (error instanceof Error) {
                    console.log("ERROR occured : ", error.message)
                    setError(error.message)
                }
            }
        }
    }

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Return Tokens</h2>
                <>
                    <label className="label">
                        <span className="label-text">Enter the amount to redeem</span>
                    </label>
                    <input
                        type="number"
                        placeholder="Enter the amount to redeem"
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
                onClick={handleReturnTokens}
            >
                Return Tokens !
            </button>}
            {result && <label className="label flex flex-col">
                <span className="label-text">Transaction Hash: {result} </span>
                <div className="flex">
                    <a target="_blank" href={blockExplorer + result} className="label-text hover:scale-125 bg-slate-500 rounded-3xl p-2"> Check it on explorer!  </a>
                    <button
                        className="btn btn-active btn-neutral"
                        disabled={false}
                        onClick={() => setResult(null)}
                    >Return tokens again</button>
                </div>
            </label>}
        </div>
    );
}