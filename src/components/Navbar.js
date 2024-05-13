import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && window.ethereum.isConnected()) {
        try {
          const ethers = require("ethers");
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const addr = await signer.getAddress();
          updateAddress(addr);
          toggleConnect(true);
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      }
    };

    checkWalletConnection();

    // Add event listener for account changes
    window.ethereum.on("accountsChanged", handleAccountChange);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, []);

  const handleAccountChange = async () => {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
      toggleConnect(true);
    } catch (error) {
      console.error("Error fetching address after account change:", error);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      toggleConnect(!connected);
      updateAddress(await window.ethereum.request({ method: "eth_accounts" }));
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const toggleWalletDropdown = () => {
    setShowWalletDropdown(!showWalletDropdown);
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-bold text-xl">
              <Link to="/">NFT Marketplace</Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={
                    location.pathname === "/"
                      ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Marketplace
                </Link>
                <Link
                  to="/sellNFT"
                  className={
                    location.pathname === "/sellNFT"
                      ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  List My NFT
                </Link>
                <Link
                  to="/profile"
                  className={
                    location.pathname === "/profile"
                      ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  }
                >
                  Profile
                </Link>
              </div>
              <button
                className={`ml-4 ${
                  connected
                    ? "bg-green-500 hover:bg-green-700"
                    : "bg-blue-500 hover:bg-blue-700"
                } text-white font-bold py-2 px-4 rounded text-sm relative`}
                onClick={connectWallet}
                onMouseEnter={toggleWalletDropdown}
                onMouseLeave={toggleWalletDropdown}
              >
                {connected ? "Connected" : "Connect Wallet"}
                {showWalletDropdown && connected && (
  <div className="absolute top-full left-0 mt-1 max-w-xs bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="block px-4 py-2 text-sm text-gray-600">Connected to:</div>
    <div className="block px-4 py-2 text-xs text-gray-600">{currAddress.toString().substring(0, 15)}...</div>
  </div>
)}



              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
