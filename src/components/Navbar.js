import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState('0x');

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && window.ethereum.isConnected()) {
        try {
          const ethers = require('ethers');
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const addr = await signer.getAddress();
          updateAddress(addr);
          toggleConnect(true);
        } catch (error) {
          console.error('Error fetching address:', error);
        }
      }
    };

    checkWalletConnection();

    // Add event listener for account changes
    window.ethereum.on('accountsChanged', handleAccountChange);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
    };
  }, []);

  const handleAccountChange = async () => {
    try {
      const ethers = require('ethers');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
      toggleConnect(true);
    } catch (error) {
      console.error('Error fetching address after account change:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      toggleConnect(true);
      updateAddress(await window.ethereum.request({ method: 'eth_accounts' }));
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className="">
      <nav className="w-screen">
        <ul className='flex items-end justify-between py-3 bg-transparent text-white pr-5'>
          <li className='flex items-end ml-5 pb-2'>
            <Link to="/">
              <div className='inline-block font-bold text-xl ml-2'>
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className='w-2/6'>
            <ul className='lg:flex justify-between font-bold mr-10 text-lg'>
              <li className={location.pathname === "/" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/">Marketplace</Link>
              </li>
              <li className={location.pathname === "/sellNFT" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/sellNFT">List My NFT</Link>
              </li>
              <li className={location.pathname === "/profile" ? 'border-b-2 hover:pb-0 p-2' : 'hover:border-b-2 hover:pb-0 p-2'}>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button className={`enableEthereumButton ${connected ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded text-sm`} onClick={connectWallet}>
                  {connected ? "Connected" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className='text-white text-bold text-right mr-10 text-sm' onClick={connectWallet}>
        {connected ? `Connected to ${currAddress.substring(0, 15)}...` : "Not Connected. Please login to view NFTs"}
      </div>
    </div>
  );
}

export default Navbar;
