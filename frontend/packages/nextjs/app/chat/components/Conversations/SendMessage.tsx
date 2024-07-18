import { useState } from "react";
import { useAccount } from "wagmi";
import { postMessagesBackend } from "../../services/postBackend";

interface Props {
    address: `0x${string}`;
    reFetchData: () => void;
}

export const SendMessage = ({ address, reFetchData }: Props) => {
    const [message, setMessage] = useState<string>("");
    const { address: accAddress } = useAccount();

    const handleSubmit = async () => {
        if (!accAddress) {
            return;
        } else {
            const timestamp = Number(Date.now());
            await postMessagesBackend({ otherAddress: address, message, timestamp, direction: "outgoing" }, accAddress).then(() => reFetchData())
            setMessage("")
        }
    }

    if (!accAddress) {
        return <></>
    }
    return (
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
        </div>)
}