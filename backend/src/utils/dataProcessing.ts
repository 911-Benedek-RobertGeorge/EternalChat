import { keccak256 } from "viem";


export class DataProcessing{



// Add padding if necessary to match the chunkSize
// Remove the last ']' to be able to append properly data
// In order to be coherent, we also remove the first '['
preprocessData(jsonString: string, chunkSize: number, appending?: boolean, padChar = '~') {
    if (jsonString.startsWith('[') && jsonString.endsWith(']')) {
        let preprocessed = jsonString.slice(1, -1);
        if(appending){
          // We need to add ','
          preprocessed = ',' + preprocessed;
        }
        // Add padding to make the length a multiple of chunkSize
        const paddingLength = chunkSize - (preprocessed.length % chunkSize);
        if (paddingLength !== chunkSize) {
            preprocessed = preprocessed.padEnd(preprocessed.length + paddingLength, padChar);
        }
        return preprocessed;
    } else {
        throw new Error(`Invalid JSON array format: ${jsonString}`);
    }
}

// Remove any padding
// Add the last ']'
// In order to match the coherence of the preprocessData we also add the first '['
postprocessData(string: string, chunkSize: number, padChar = '~') {
// Remove the padding before adding the brackets
// Use a regular expression to remove padding characters that appear after `}`
const trimmedString = string.replace(new RegExp(`\\}${padChar}*`, 'g'), '}');
return '[' + trimmedString + ']';
}



chunkData(data:string, chunkSize: number, padChar = '~') : string[]{
let chunks : string[]= [];
for (let i = 0; i < data.length; i += chunkSize) {
    let chunk = data.slice(i, i + chunkSize);
    if (chunk.length < chunkSize) {
        chunk = chunk.padEnd(chunkSize, padChar);
    }
    chunks.push(chunk);
}
return chunks;
}

hashChunk(chunk: string): string {
    return keccak256(Buffer.from(chunk));
}

async appendData(prevData: any , data2: any, chunkSize: number) {
    let appending =true;
    if(prevData.length == 0 || data2.length == 0){
        appending= false;
    }
    // Preprocess the new data
    const data2Json = JSON.stringify(data2);
    const preprocessedData2 = this.preprocessData(data2Json, chunkSize, appending);

    // Combine the previous processed data with the new preprocessed data
    const prevDataJson = JSON.stringify(prevData);
    const preprocessedData = this.preprocessData(prevDataJson, chunkSize);
    const combinedData = preprocessedData + preprocessedData2;

    // Chunk the combined data
    const combinedChunks = this.chunkData(combinedData, chunkSize);
    const numChunks = combinedChunks.length;

    // Calculate the new Merkle root
    const newHashes = combinedChunks.map(this.hashChunk);
    const newMerkleRoot = this.calculateMerkleRoot(newHashes);

    // Calculate the Merkle root of the appended data
    const appendedHashes = this.chunkData(preprocessedData2, chunkSize).map(this.hashChunk);
    const merkleRootOfAppendedData = this.calculateMerkleRoot(appendedHashes);

    return {
        combinedData,
        newMerkleRoot,
        merkleRootOfAppendedData,
        newNumChunks: numChunks
    };
}



    // calculateMerkleRoot(hashes: string[]): string {
    //     if (hashes.length === 1) {
    //       return hashes[0];
    //     }
      
    //     const newHashes: string[] = [];
    //     for (let i = 0; i < hashes.length; i += 2) {
    //       if (i + 1 < hashes.length) {
    //         // Concatenate the hashes and hash them again
    //         const combinedHash = keccak256(Buffer.concat([
    //           Buffer.from(hashes[i].slice(2), 'hex'),
    //           Buffer.from(hashes[i + 1].slice(2), 'hex')
    //         ]));
    //         newHashes.push(combinedHash);
    //       } else {
    //         // If there is an odd number of elements, push the last one
    //         newHashes.push(hashes[i]);
    //       }
    //     }
      
    //     return this.calculateMerkleRoot(newHashes);
    //   }

    calculateMerkleRoot(hashes: string[]): string {
        while (hashes.length > 1) {
          const newHashes : string[]= [];
          for (let i = 0; i < hashes.length; i += 2) {
            if (i + 1 < hashes.length) {
              // Concatenate the hashes and hash them again
              const combinedHash = keccak256(Buffer.concat([
                Buffer.from(hashes[i].slice(2), 'hex'),
                Buffer.from(hashes[i + 1].slice(2), 'hex')
              ]));
              newHashes.push(combinedHash);
            } else {
              // If there is an odd number of elements, push the last one
              newHashes.push(hashes[i]);
            }
          }
          hashes = newHashes;
        }
        return hashes[0];
      }


}