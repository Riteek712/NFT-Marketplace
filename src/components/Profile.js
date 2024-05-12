import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useEffect, useState } from "react";
import NFTTile from "./NFTTile";
const ethers = require("ethers");
export default function Profile () {
    const [data, updateData] = useState([]);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState(0);

    const  getAccountData = async () =>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        updateAddress(addr)
        const balance = await signer.getBalance();
        
        console.log(balance)
        const balanceInWei = ethers.BigNumber.from(balance._hex);
        const balanceInEther = ethers.utils.formatEther(balanceInWei);
        console.log(balanceInEther)
        updateTotalPrice(parseFloat(balanceInEther).toFixed(8))

        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        let listedNFTs =  await contract.getMyNFTs()
        updateData(listedNFTs)
        console.log(listedNFTs)

    }
    useEffect(() =>{
        getAccountData()
    }, [])
    
    
    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
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
                <div className="flex justify-center flex-wrap max-w-screen-xl">
                    {/* {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                    })} */}
                </div>
                <div className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                </div>
            </div>
            </div>
        </div>
    )
};