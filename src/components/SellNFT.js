import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";
import axios from "axios";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    // const [showCompressionAlert, setCompressionAlert] = useState(false)
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();
    async function OnChangeFile(e){
        let file = e.target.files[0]
        try{
            const formData = new FormData();
            formData.append('file', file);  // Match the field name with your FastAPI endpoint
            formData.append('k', 16);  // Example value for k (compression factor)

            const cresponse = await axios.post('http://localhost:8000/compress', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const message = `Image Size: ${cresponse.data.original_size}\nCompressed Image Size: ${cresponse.data.compressed_size}\nCompression ratio: ${cresponse.data.compression_ratio}\nNormalized Cross Correlation: ${cresponse.data.ncc}\nPSNR: ${parseFloat(cresponse.data.psnr).toFixed(2)} dB`
            alert(message)
            
            

            const response = await uploadFileToIPFS(file)
            if(response.success ===true){
                alert("Pinata IPFS recived the data!")
                console.log("Uploaded image to pinata: ", response.pinataURL)
                setFileURL(response.pinataURL)
            }
        }catch(e){
            console.log("Error during file upload", e)
        }
    }

    async function uploadMetadataToIpfs(){
        const {name, description, price} = formParams
        if (!name || !description||!price ||!fileURL){
            return
        }

        const nftJSON = {
            name,
            description,
            price,
            image: fileURL
        };

        try{
            const res = await uploadJSONToIPFS(nftJSON)
            if(res.success ==true){
                console.log("Uploaded JSOn to Pinata: ", res)
                alert("Image uploaded")
                return res.pinataURL;
            }
            
        }catch(e){
            console.log("erroe uploading json metadata: ", e)

        }
    }

    async function listNFT(e){
        e.preventDefault()

        try{
            const metaDataUrl = await uploadMetadataToIpfs()
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()

            updateMessage("Please wait ... uploading (approx time 5 mins)")

            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)
            let price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            let transaction = await contract.createToken(metaDataUrl, price, {value: listingPrice});

            await transaction.wait()

            alert("Successfully listed your NFT!");
            updateMessage("")
            updateFormParams({name:'',description:'',price:''})
            window.location.replace("/")

        }catch(e){
            console.log("Upload error: "+ e)
        }
    }

    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name} />
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}/>
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={OnChangeFile}></input>
                </div>
                <p>Wait for the IPFS upload and Image data alert befour listing!!</p>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={listNFT} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="list-button">
                    List NFT
                </button>
            </form>
        </div>
        </div>
    )
}
