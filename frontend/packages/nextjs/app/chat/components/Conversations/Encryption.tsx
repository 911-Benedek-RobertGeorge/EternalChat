import { useState } from "react";
import { useAccount } from "wagmi";
import { postMessagesBackend } from "../../services/postBackend";
import * as crypto from 'crypto';
import { encrypt as encryptlib } from 'eciesjs';

const algorithm = 'aes-256-ctr';
const key: Buffer = crypto.randomBytes(32); // Ensure key is a Buffer
interface Props {
    address: `0x${string}`;
    reFetchData: () => void;
}

function hexToUint8Array(hex: string): Uint8Array {
    const buffer = Buffer.from(hex.replace(/^0x/, ''), 'hex');
    if (buffer.length !== 33 && buffer.length !== 65) {
        throw new Error("Public key length must be 33 or 65 bytes.");
    }
    return new Uint8Array(buffer);
}

function encryptSK(receiverRawPK: string | Buffer, msg: Buffer): Buffer {
    const publicKey = typeof receiverRawPK === 'string'
        ? hexToUint8Array(receiverRawPK)
        : new Uint8Array(receiverRawPK);

    return encryptlib(Buffer.from(publicKey), msg);
}

function encrypt(message: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted_text = cipher.update(message, 'utf8', 'hex');
    encrypted_text += cipher.final('hex');
    return iv.toString('hex') + encrypted_text;
}

function decrypt(encrypted_text: string): string {
    const iv = Buffer.from(encrypted_text.slice(0, 32), 'hex');
    const encryptedMessage = encrypted_text.slice(32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted_text = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted_text += decipher.final('utf8');
    return decrypted_text;
}

export const SendMessage = ({ address, reFetchData }: Props) => {
    const [message, setMessage] = useState<string>("");
    const [encryptedMessage, setEncryptedMessage] = useState<string>("");
    const [decryptedMessage, setDecryptedMessage] = useState<string>("");
    const [sendEncrypted, setSendEncrypted] = useState<boolean>(false);
    const [messageToDecrypt, setMessageToDecrypt] = useState<string>("");
    const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState<string>("");
    const [symmetricKey, setSymmetricKey] = useState<string>("");
    const { address: accAddress } = useAccount();

    const handleSubmit = async () => {
        if (!accAddress || !message) {
            return;
        }
        const timestamp = Number(Date.now());
        const finalMessage = sendEncrypted ? encrypt(message) : message;

        
        console.log("Symmetric Key:", key.toString('hex'));
        setSymmetricKey(key.toString('hex'));

        try {
            const encSymKey = encryptSK(address, key);
            console.log("Encrypted Symmetric Key:", encSymKey.toString('hex'));
            setEncryptedSymmetricKey(encSymKey.toString('hex'));
        } catch (error) {
            console.error("Error encrypting symmetric key:", error);
        }

        await postMessagesBackend({ otherAddress: address, message: finalMessage, timestamp, direction: "outgoing" }, accAddress)
            .then(() => reFetchData());
        setMessage("");
    }

    const handleClickEncrypt = () => {
        if (!accAddress) {
            return;
        }
        const encrypted_message = encrypt(message);
        setEncryptedMessage(encrypted_message);
    };

    const handleClickDecrypt = () => {
        if (!encryptedMessage) {
            return;
        }
        const decrypted_message = decrypt(encryptedMessage);
        setDecryptedMessage(decrypted_message);
    }

    const handleDecryptInputMessage = () => {
        if (!messageToDecrypt) {
            return;
        }
        const decrypted_message = decrypt(messageToDecrypt);
        setDecryptedMessage(decrypted_message);
    }

    if (!accAddress) {
        return <></>;
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
                        }}}
                />
                <button
                    className="btn btn-active btn-neutral"
                    disabled={false}
                    onClick={handleSubmit}
                >
                    Send!
                </button>
                <button
                    className="btn btn-active btn-neutral"
                    disabled={false}
                    onClick={handleClickEncrypt}
                >
                    Encrypt
                </button>
                <button
                    className="btn btn-active btn-neutral"
                    disabled={false}
                    onClick={handleClickDecrypt}
                >
                    Decrypt
                </button>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={sendEncrypted}
                        onChange={() => setSendEncrypted(!sendEncrypted)}
                    />
                    <span>Send Encrypted</span>
                </label>
            </div>
         
            {decryptedMessage && (
                <div className="decrypted-message">
                    Decrypted: {decryptedMessage}
                </div>
            )}
            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Enter encrypted message to decrypt"
                    className="input input-bordered flex-grow"
                    value={messageToDecrypt}
                    onChange={e => setMessageToDecrypt(e.target.value)}
                />
                <button
                    className="btn btn-active btn-neutral"
                    disabled={false}
                    onClick={handleDecryptInputMessage}
                >
                    Decrypt Message
                </button>
            </div>
            {symmetricKey && (
                <div className="symmetric-key">
                    Symmetric Key: {symmetricKey}
                </div>
            )}
            {encryptedSymmetricKey && (
                <div className="encrypted-symmetric-key">
                    Encrypted Symmetric Key: {encryptedSymmetricKey}
                </div>
            )}
        </div>
    );
}
