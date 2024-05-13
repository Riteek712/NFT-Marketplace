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

    useEffect(() => {
        document.body.style.backgroundColor = '#f9fafb'; // Set background color
    }, []);

    return (
        <div>
            <Navbar />
            {loading ? (
                // Render loading animation while fetching data
                <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
                    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0117.373 6H20a8 8 0 00-8-8v4zm12-2A8 8 0 016 19.373V22a8 8 0 008-8h4zM19.373 18A8 8 0 0122 12h-4a8 8 0 008 8v-4z"></path>
                    </svg>
                </div>
            ) : (
                <div className="flex flex-col place-items-center mt-20">
                    <div className="md:text-xl font-bold text-gray-800">Top NFTs</div>
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
