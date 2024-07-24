import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { postMessagesBackend } from "../../services/postBackend";
import CryptoJS from "crypto-js";


const generateSecretKey = () => {
    const array = new Uint8Array(32); 
    window.crypto.getRandomValues(array);
    return CryptoJS.enc.Hex.parse(Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('')).toString();
};


const generateIV = () => {
    const array = new Uint8Array(16); 
    window.crypto.getRandomValues(array);
    return CryptoJS.enc.Hex.parse(Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('')).toString();
};


const encryptWithKey = (text: string, key: string, iv: string) => {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const ivHex = CryptoJS.enc.Hex.parse(iv);
    return CryptoJS.AES.encrypt(text, keyHex, { iv: ivHex }).toString();
};

const decryptWithKey = (ciphertext: string, key: string, iv: string) => {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const ivHex = CryptoJS.enc.Hex.parse(iv);
    const bytes = CryptoJS.AES.decrypt(ciphertext, keyHex, { iv: ivHex });
    console.log("here", bytes.toString(CryptoJS.enc.Utf8)); 
    return bytes.toString(CryptoJS.enc.Utf8);
};

interface Props {
    address: `0x${string}`;
    reFetchData: () => void;
}

export const SendMessage = ({ address, reFetchData }: Props) => {
    const [message, setMessage] = useState<string>("");
    const [encryptedMessage, setEncryptedMessage] = useState<string>("");
    const [encryptedSecretKey, setEncryptedSecretKey] = useState<string>("");
    const [displayMessage, setDisplayMessage] = useState<string>("");
    const [iv, setIv] = useState<string>(""); 
    const { address: accAddress } = useAccount();

    
    const secretKey = generateSecretKey();
    const initializationVector = generateIV(); 

    useEffect(() => {
        console.log("===========");
        console.log(address);
        console.log("===========");
        console.log(secretKey);
        console.log("===========");
    }, []);

    
    const handleSubmit = async () => {
        if (!accAddress || !message) {
            return;
        } else {
            const timestamp = Number(Date.now());
            
            const encryptedKey = encryptWithKey(secretKey, accAddress, initializationVector);
            const encryptedMsg = encryptWithKey(message, secretKey, initializationVector);

            await postMessagesBackend({ otherAddress: address, message: encryptedMsg, timestamp, direction: "outgoing" }, accAddress)
                .then(() => reFetchData());

            setEncryptedSecretKey(encryptedKey);
            setEncryptedMessage(encryptedMsg);
            setIv(initializationVector); 
            setMessage("");
        }
    };

    
    const handleDecrypt = () => {
        if (!accAddress || !encryptedMessage || !encryptedSecretKey || !iv) {
            return;
        }

    
        const decryptedKey = decryptWithKey(encryptedSecretKey, accAddress, iv);
    
        const decryptedMsg = decryptWithKey(encryptedMessage, decryptedKey, iv);
        setDisplayMessage(decryptedMsg);
    };

    if (!accAddress) {
        return <></>;
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Write your message!"
                    className="input input-bordered flex-grow"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            handleSubmit();
                        }
                    }}
                />
                <button
                    className="btn btn-active btn-neutral"
                    disabled={false}
                    onClick={handleSubmit}
                >
                    Send!
                </button>
            </div>
            {encryptedMessage && (
                <div>
                    <button
                        className="btn btn-active btn-secondary"
                        onClick={handleDecrypt}
                    >
                        Decrypt Message
                    </button>
                    <div className="mt-4">
                        <p>Message: {displayMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
