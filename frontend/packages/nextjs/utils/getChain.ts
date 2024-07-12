import * as chains from "viem/chains";
export type ChainKeys = keyof typeof chains;


function isValidChainKey(key: string): key is ChainKeys {
    return key in chains;
}

export function getChainFromEnv(): chains.Chain {
    const envChain: string | undefined = process.env.NEXT_PUBLIC_CHAIN_ENV;
    if (envChain && isValidChainKey(envChain)) {
        return chains[envChain];
    } else {
        return chains.sepolia;
    }
}

