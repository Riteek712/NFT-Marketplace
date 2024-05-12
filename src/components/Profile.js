import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MarketplaceJSON from '../Marketplace.json';
import NFTTile from './NFTTile';
import { GetIpfsUrlFromPinata } from '../utils';
import axios from 'axios';
const ethers = require('ethers');// Check if ethers should be imported this way

export default function Profile() {
  const [data, updateData] = useState([]);
  const [address, updateAddress] = useState('0x');
  const [totalPrice, updateTotalPrice] = useState(0);
  const [isLoading, setLoading] = useState(true);

  const getAccountData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
      const balance = await signer.getBalance();

      const balanceInWei = ethers.BigNumber.from(balance._hex);
      const balanceInEther = ethers.utils.formatEther(balanceInWei);
      updateTotalPrice(parseFloat(balanceInEther).toFixed(8));

      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );

      let listedNFTs = await contract.getMyNFTs();
      const items = await Promise.all(listedNFTs.map(
        async (i) =>{
            const tokenURI = await contract.tokenURI(i.tokenId)
            const ipfsUrl = GetIpfsUrlFromPinata(tokenURI)
            const meta = await axios.get(ipfsUrl)
            const price =ethers.utils.formatUnits(i.price.toString(), 'ether')
            return {
                price,
                tokenId : i.tokenId.toNumber(),
                image:meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
        }
      ))
      updateData(items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccountData();
  }, []);

  return (
    <div className="profileClass" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="profileClass">
        <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
          <div className="mb-5">
            <h2 className="font-bold">Wallet Address</h2>
            {address}
          </div>
        </div>
        <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
          <div>
            <h2 className="font-bold">No. of NFTs</h2>
            {data.length}
          </div>
          <div className="ml-20">
            <h2 className="font-bold">Total Value</h2>
            {totalPrice} ETH
          </div>
        </div>
        <div className="flex flex-col text-center items-center mt-11 text-white">
          <h2 className="font-bold">Your NFTs</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex justify-center flex-wrap max-w-screen-xl">
              {data.map((value, index) => (
                <NFTTile data={value} key={index} />
              ))}
            </div>
          )}
          <div className="mt-10 text-xl">
            {data.length === 0 ? 'Oops, No NFT data to display (Are you logged in?)' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
