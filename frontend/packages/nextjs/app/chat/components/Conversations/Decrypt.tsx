import { useWeb3React } from "@web3-react/core";
import { useState } from "react";
import styled from "styled-components";
import { CopyToClipboard } from 'react-copy-to-clipboard';

export function Decrypt({ isActive }: { isActive: boolean }) {
  const { account, library } = useWeb3React();
  const [encryptedMessage, setEncryptedMessage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDecrypt = async () => {
    if (encryptedMessage.trim() === "") {
      setError("Encrypted message must have a value");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!library || !account) {
      setError("Provider or account is not available");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const decryptedMessage = await library.send("eth_decrypt", [encryptedMessage, account]);
      setMessage(decryptedMessage);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClear = () => {
    setEncryptedMessage('');
    setMessage('');
  };

  return (
    <Tab isActive={isActive} requiresConnection={true}>
      {message ? (
        <>
          <Text>This is your decrypted message</Text>
          <TextArea
            id="message"
            autoComplete="off"
            disabled={true}
            placeholder="Your decrypted message will appear here..."
            value={message}
          />
          <ButtonWrapper>
            <Button onClick={handleClear}>Clear</Button>
            <CopyToClipboard text={message} onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            }}>
              <Button disabled={copied}>{copied ? 'Copied!' : 'Copy'}</Button>
            </CopyToClipboard>
          </ButtonWrapper>
        </>
      ) : (
        <>
          <Text>Enter an encrypted message</Text>
          <TextArea
            id="encrypted-message"
            autoComplete="off"
            placeholder="Enter the encrypted message here..."
            value={encryptedMessage}
            onChange={(e) => setEncryptedMessage(e.target.value)}
          />
          <Button onClick={handleDecrypt}>Decrypt</Button>
        </>
      )}
      {error && <TextError>{error}</TextError>}
    </Tab>
  );
}

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
`;

const Text = styled.p`
  font-size: 16px;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TextError = styled.p`
  color: red;
  font-size: 14px;
`;

const Tab = styled.div<{ isActive: boolean; requiresConnection: boolean }>`
  display: ${props => (props.isActive ? 'block' : 'none')};
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  ${props => props.requiresConnection && `
    /* Add styles if connection is required */
  `}
`;
