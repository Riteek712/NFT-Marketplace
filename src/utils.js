// export const GetIpfsUrlFromPinata = (pinataUrl) => {
//     var IPFSUrl = pinataUrl.split("/");
//     const lastIndex = IPFSUrl.length;
//     IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
//     return IPFSUrl;
// };
// // utils.js
export const GetIpfsUrlFromPinata = (pinataUrl) => {
    if (!pinataUrl || typeof pinataUrl !== 'string') {
        console.error('Invalid pinataUrl:', pinataUrl);
        return null;
    }

    const urlParts = pinataUrl.split('/');
    const ipfsHash = urlParts.pop(); // Remove the empty string caused by the trailing slash
    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    return ipfsUrl;
};
