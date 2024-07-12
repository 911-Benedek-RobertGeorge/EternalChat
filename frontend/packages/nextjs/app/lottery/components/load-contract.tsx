/* eslint-disable prettier/prettier */
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { abi as lotteryAbi } from "../../../abi/Lottery.json"
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";


export function LoadContractAddress({ address, setAddress, setTokenAddress }: { address: string, setAddress: Dispatch<SetStateAction<string>>, setTokenAddress: Dispatch<SetStateAction<string | null>> }) {
    const [error, setError] = useState<string | null>(null)
    const [localAddress, setLocalAddress] = useState<string>("0x707e39cefede2c48a82b64b14347820011852146")
    const client = usePublicClient();
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("Lottery");

    useEffect(() => {
        if (address) {
            client?.readContract({
                abi: lotteryAbi,
                address: address,
                functionName: "paymentToken",
            }).then((addr) => setTokenAddress(addr as string)).catch((e: Error) => {
                console.log("ERROR occured : ", e.message)
                throw e;
            })
        }
    }, [address])

    if (!deployedContractLoading && deployedContractData) {
        setAddress(deployedContractData.address)
    }

    const checkSetAddress = (address: string) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setError("Invalid contract address");
        }
        else {
            setAddress(address);
        }

    }

    return (
        <div className="card w-full  bg-primary text-primary-content mt-4 p-4 ">
            <div className="card-body">
                <h2 className="card-title">Load Lottery Contract</h2>
                {address ? (
                    <>
                        <label className="label">
                            <span className="label-text">Contract loaded at: {address}</span>
                        </label>
                    </>

                ) : (

                    <>
                        <label className="label">
                            <span className="label-text">Enter contract address:</span>
                        </label>
                        <input
                            type="text"
                            placeholder="0x707e39cefede2c48a82b64b14347820011852146"
                            className="input input-bordered w-full "
                            value={localAddress}
                            onChange={e => setLocalAddress(e.target.value)}
                        />
                        <button
                            className="btn w-[40%] items-center justify-center btn-active btn-neutral"
                            onClick={() => checkSetAddress(localAddress)}>
                            Load the contract
                        </button>
                        {error && <p className="text-color red">{error}</p>}

                    </>)
                }
            </div >
        </div >
    );
}