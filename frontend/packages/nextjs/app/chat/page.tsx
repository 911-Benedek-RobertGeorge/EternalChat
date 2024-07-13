"use client"

import type { NextPage } from "next";
import { useState } from "react";
import useReRender from "~~/hooks/useReRender";

const Chat: NextPage = () => {
    const [address, setAdress] = useState("");
    const { reRender: reRenderLotteryState, count: shouldReRender } = useReRender();
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);

    const debugMode = process.env.NEXT_PUBLIC_CHAIN_ENV == "hardhat"
    let blockExplorer = "";
    if (debugMode) blockExplorer = "http://localhost:3000/blockexplorer/transaction/"
    else blockExplorer = "https://sepolia.etherscan.io/tx/"


    return (
        <>
            <div className="text-center mt-8 bg-secondary p-10">
                <h1 className="text-4xl my-0">Chat</h1>
                <div >
                    <br />
                </div>
            </div>
        </>
    );
};

export default Chat;
