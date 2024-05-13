import React from "react";
import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile(data) {
    const newTo = {
        pathname: "/nftPage/" + data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo}>
            <div className="relative border-2 border-gray-300 rounded-lg w-48 h-56 md:w-64 md:h-72 overflow-hidden transition-transform transform-gpu hover:translate-y-[-5px] hover:shadow-lg hover:border-purple-500 hover:scale-105 mr-4 mb-4">
                <img src={IPFSUrl} alt="" className="w-full h-full rounded-lg object-cover transform-gpu hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#454545] to-transparent p-2 text-white">
                    <strong className="text-sm md:text-lg">{data.data.name}</strong>
                    <p className="text-xs md:text-sm">{data.data.description}</p>
                </div>
            </div>
        </Link>
    )
}

export default NFTTile;
