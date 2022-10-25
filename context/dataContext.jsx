import { MARKETPLACE_ADDRESS } from "@/helpers/utils";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useState } from "react";

export const dataContext = createContext();
export const useDataContext = () => useContext(dataContext);

function DataProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [showMintModal, setShowMintModal] = useState(false);
  const [collectionContract, setCollectionContract] = useState("");

  const address = useAddress();

  const { contract } = useContract(MARKETPLACE_ADDRESS);

  const { contract: collection } = useContract(collectionContract);

  useEffect(() => {
    if (!contract || isLoading) return;
    getListings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    if (!address) return;
    getCollectionContract();
    if (!collection) return;
    getNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, collection]);

  //! Fetch all listings
  const getListings = async () => {
    setIsLoading(true);
    try {
      const list = await contract.getAllListings();
      setListings(list);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  //! Fetch NFTS for Creating Listing
  const getNFTs = async () => {
    try {
      const data = await collection.getAll();
      let Nfts = [];

      data.forEach((each) => {
        if (each.owner === address) {
          Nfts.push({
            label: each.metadata,
            value: {
              tokenId: each.metadata.id,
              tokenAddress: collectionContract,
            },
          });
        }
      });

      setNfts(Nfts);
    } catch (error) {
      console.log(error);
    }

    // const url = `https://deep-index.moralis.io/api/v2/${address}/nft?chain=mumbai&format=decimal`;

    // try {
    //   const res = await fetch(url, {
    //     method: "GET",
    //     headers: {
    //       accept: "application/json",
    //       "X-API-Key":
    //         "8SdNPyuDmzLJLVhYIWuchPbkjSQ9CWuBNxrA4ZWjyj6dozJKqWpEqM2uyCJJSTdt",
    //     },
    //   });

    //   const data = await res.json();

    //   let nfts = [];

    //   data.result.forEach((each) => {
    //     if (!!each.metadata) {
    //       nfts.push({
    //         // label: JSON.parse(each.metadata).image,
    //         label: JSON.parse(each.metadata),
    //         value: {
    //           tokenId: each.token_id,
    //           tokenAddress: each.token_address,
    //         },
    //       });
    //     }
    //   });
    //   setNfts(nfts);
    // } catch (error) {
    //   console.log(error);
    // }
  };

  //! Fetch Collection Contract to mint NFT
  const getCollectionContract = async () => {
    const url = `https://deep-index.moralis.io/api/v2/${address}/nft/collections?chain=mumbai`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-Key":
            "8SdNPyuDmzLJLVhYIWuchPbkjSQ9CWuBNxrA4ZWjyj6dozJKqWpEqM2uyCJJSTdt",
        },
      });

      const data = await res.json();
      let collectionAddr = "";
      data.result.forEach((each) => {
        if (each.symbol === "RIVR") {
          collectionAddr = each.token_address;
        }
      });
      setCollectionContract(collectionAddr);
    } catch (error) {
      console.log(error);
    }
  };

  const contextValue = {
    getListings,
    getNFTs,
    getCollectionContract,
    listings,
    setListings,
    isLoading,
    setIsLoading,
    showListModal,
    setShowListModal,
    nfts,
    setNfts,
    showMintModal,
    setShowMintModal,
    collectionContract,
    setCollectionContract,
  };

  return (
    <dataContext.Provider value={contextValue}>{children}</dataContext.Provider>
  );
}

export default DataProvider;
