import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import NFTTile from "./NFTTile";
import { GetIpfsUrlFromPinata } from "../utils";
import axios from "axios";
const ethers = require("ethers");

export default function Profile() {
  const [data, updateData] = useState([]);
  const [address, updateAddress] = useState("0x");
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
      const items = await Promise.all(
        listedNFTs.map(async (i) => {
          const tokenURI = await contract.tokenURI(i.tokenId);
          const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
          const meta = await axios.get(ipfsUrl);
          const price = ethers.utils.formatUnits(i.price.toString(), "ether");
          return {
            price,
            tokenId: i.tokenId.toNumber(),
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
        })
      );
      updateData(items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching account data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccountData();
  }, []);

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-content flex flex-col items-center justify-center text-white">
        <div className="wallet-info text-center">
          <h2 className="font-bold text-xl mb-3">Wallet Address</h2>
          <p>{address}</p>
        </div>
        <div className="account-summary flex justify-center mt-8 text-center">
          <div className="summary-item">
            <h2 className="font-bold text-xl">No. of NFTs</h2>
            <p>{data.length}</p>
          </div>
          <div className="summary-item ml-12">
            <h2 className="font-bold text-xl">Total Value</h2>
            <p>{totalPrice} ETH</p>
          </div>
        </div>
        <div className="your-nfts mt-12 text-center">
          <h2 className="font-bold text-2xl mb-6">Your NFTs</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="nft-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.map((value, index) => (
                <NFTTile data={value} key={index} />
              ))}
            </div>
          )}
          <div className="no-nft-text mt-8 text-lg">
            {data.length === 0 &&
              !isLoading &&
              "Oops, No NFT data to display (Are you logged in?)"}
          </div>
        </div>
      </div>
    </div>
  );
}
