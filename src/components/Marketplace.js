import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import Navbar from './Navbar';
import NFTTile from './NFTTile';
import MarketplaceJSON from '../Marketplace.json';
import { GetIpfsUrlFromPinata } from '../utils';

export default function Marketplace() {
    const [data, setData] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
                const transaction = await contract.getAllNFTs();
                const items = await Promise.all(transaction.map(async (i) => {
                    const tokenURI = await contract.tokenURI(i.tokenId);
                    console.log("getting this tokenUri", tokenURI);
                    const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
                    const meta = await axios.get(ipfsUrl);
                    const price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                    return {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: meta.data.image,
                        name: meta.data.name,
                        description: meta.data.description,
                    };
                }));
                setData(items);
                setDataFetched(true);
            } catch (error) {
                console.error('Error fetching NFT data:', error);
                // Handle error (e.g., show error message to users)
            } finally {
                setLoading(false);
            }
        }

        if (!dataFetched) {
            fetchData();
        }
    }, [dataFetched]);

    return (
        <div>
            <Navbar />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="flex flex-col place-items-center mt-20">
                    <div className="md:text-xl font-bold text-white">Top NFTs</div>
                    <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                        {data.map((value, index) => (
                            <NFTTile data={value} key={index} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
