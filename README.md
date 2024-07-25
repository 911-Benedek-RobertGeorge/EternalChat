# EternalChat
EternalChat is an innovative infrastructure messaging app designed for social media platforms. Leveraging the power of IPFS and blockchain technology, EternalChat ensures that user messages are securely stored and accessible, regardless of the status of any single app or platform.

How to start the project localy: 
cd Infrastructure-App 
yarn chain
yarn deploy 
yarn start


Information:
- Encryption hasn't been finished, for now messages are in clear (encryption use a shared symmetric key, encrypted using users' publicKey)
- Helia node is not networking despite countless tries: Matheus suggestion seems to use Kubo for the node and maybe send with helia.
- The current structure is mixing the backend with the ipfs node, this should be improve
- No frontend for the incentivize system