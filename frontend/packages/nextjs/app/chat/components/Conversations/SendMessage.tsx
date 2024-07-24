import { useState } from "react";
import { useAccount } from "wagmi";
import { Buffer } from 'buffer';
import sigUtil from '@metamask/eth-sig-util';
import { postMessagesBackend } from "../../services/postBackend";

interface Props {
    address: `0x${string}`;
    reFetchData: () => void;
}

export const SendMessage = ({ address, reFetchData }: Props) => {
    const [message, setMessage] = useState<string>("");
    const [encryptedMessage, setEncryptedMessage] = useState<string>("");
    const [decryptedMessage, setDecryptedMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { address: accAddress } = useAccount();

    const encryptMessage = async () => {
        if (!accAddress || !message) {
            return;
        }

        setLoading(true);
        try {
            const encryptionPublicKey = await window.ethereum.request({
                method: 'eth_getEncryptionPublicKey',
                params: [accAddress]
            });

            console.log("Encryption Public Key:", encryptionPublicKey);

            const encryptedData = sigUtil.encrypt({
                publicKey: encryptionPublicKey,
                data: message,
                version: 'x25519-xsalsa20-poly1305'
            });

            const encryptedValue = '0x' + Buffer.from(JSON.stringify(encryptedData)).toString('hex');
            console.log("Encrypted Value:", encryptedValue);

            setEncryptedMessage(encryptedValue);
        } catch (error) {
            console.error("Error encrypting message:", error);
        } finally {
            setLoading(false);
        }
    };

    const decryptMessage = async () => {
        if (!encryptedMessage || !accAddress) {
            return;
        }

        setLoading(true);
        try {
            const decryptedValue = await window.ethereum.request({
                method: 'eth_decrypt',
                params: [encryptedMessage, accAddress]
            });
            setDecryptedMessage(decryptedValue);
        } catch (error) {
            console.error("Error decrypting message:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!accAddress || !message) {
            return;
        }

        setLoading(true);
        try {
            const timestamp = Number(Date.now());
            await postMessagesBackend({ otherAddress: address, message, timestamp, direction: "outgoing" }, accAddress);
            reFetchData();
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!accAddress) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
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
                    disabled={!message || loading}
                    onClick={handleSubmit}
                >
                    {loading ? "Sending..." : "Send!"}
                </button>
            </div>
            <div className="flex space-x-4">
                <button
                    className="btn btn-active btn-neutral"
                    disabled={!message || loading}
                    onClick={encryptMessage}
                >
                    Encrypt
                </button>
                <button
                    className="btn btn-active btn-neutral"
                    disabled={!encryptedMessage || loading}
                    onClick={decryptMessage}
                >
                    Decrypt
                </button>
            </div>
            {encryptedMessage && (
                <div>
                    <h3>Encrypted Message:</h3>
                    <p>{encryptedMessage}</p>
                </div>
            )}
            {decryptedMessage && (
                <div>
                    <h3>Decrypted Message:</h3>
                    <p>{decryptedMessage}</p>
                </div>
            )}
        </div>
    );
};
