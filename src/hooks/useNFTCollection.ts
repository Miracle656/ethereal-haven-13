import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { DIVINITY_NFT_ADDRESS, DIVINITY_NFT_ABI } from "@/config/nft";

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface LiveNFT {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadata: NFTMetadata;
  chainInfo?: {
    chainNamespace: string;
    chainId: string;
    isUEA: boolean;
  };
}

export interface CollectionStats {
  totalMinted: number;
  maxSupply: number;
  remaining: number;
  mintPrice: string;
  rawMintPrice: bigint;  // ← ADD THIS!
  mintingEnabled: boolean;
  floorPrice: string;
  mintsFromEthereum: number;
  mintsFromSolana: number;
  mintsFromPushChain: number;
  mintsFromOtherChains: number;
}

export const useNFTCollection = (contractAddress: string = DIVINITY_NFT_ADDRESS) => {
  const [nfts, setNfts] = useState<LiveNFT[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get provider (supports both browser wallet and RPC)
  const getProvider = useCallback(() => {
    // if (window.ethereum) {
    //   return new ethers.BrowserProvider(window.ethereum);
    // }
    // Fallback to Push Chain RPC for read-only
    return new ethers.JsonRpcProvider(
      "https://evm.rpc-testnet-donut-node1.push.org/"
    );
  }, []);

  // Convert IPFS URI to gateway URL
  const getIPFSUrl = (uri: string): string => {
    if (uri.startsWith("ipfs://")) {
      const hash = uri.replace("ipfs://", "");
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return uri;
  };

  // Fetch metadata from IPFS
  const fetchMetadata = async (tokenURI: string): Promise<NFTMetadata> => {
    try {
      const url = getIPFSUrl(tokenURI);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch metadata");

      const metadata = await response.json();

      // Convert image IPFS URI to gateway URL
      if (metadata.image) {
        metadata.image = getIPFSUrl(metadata.image);
      }

      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata from ${tokenURI}:`, error);
      return {
        name: "Unknown",
        description: "Metadata unavailable",
        image: "https://via.placeholder.com/400",
      };
    }
  };

  // Load collection stats
  const loadCollectionStats = useCallback(async () => {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        contractAddress,
        DIVINITY_NFT_ABI,
        provider
      );

      // Check if contract exists
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        console.warn("Contract not found at address:", contractAddress);
        return null;
      }

      const [
        totalMinted,
        maxSupply,
        mintPrice,
        mintingEnabled,
        mintStats,
      ] = await Promise.all([
        contract.totalMinted(),
        contract.MAX_SUPPLY(),
        contract.mintPrice(),
        contract.mintingEnabled(),
        contract.getMintStats(),
      ]);

      const stats: CollectionStats = {
        totalMinted: Number(totalMinted),
        maxSupply: Number(maxSupply),
        remaining: Number(maxSupply) - Number(totalMinted),
        mintPrice: ethers.formatEther(mintPrice),
        rawMintPrice: mintPrice,  // ← ADD THIS! Raw BigInt value
        mintingEnabled,
        floorPrice: "—", // Will be calculated from marketplace listings
        mintsFromEthereum: Number(mintStats[2]),
        mintsFromSolana: Number(mintStats[3]),
        mintsFromPushChain: Number(mintStats[4]),
        mintsFromOtherChains: Number(mintStats[5]),
      };

      setStats(stats);
      return stats;
    } catch (error: any) {
      console.error("Error loading collection stats:", error);
      setError(error?.message || "Failed to load collection stats");
      return null;
    }
  }, [contractAddress, getProvider]);

  // Load all NFTs from the collection
  const loadNFTs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = getProvider();
      const contract = new ethers.Contract(
        contractAddress,
        DIVINITY_NFT_ABI,
        provider
      );

      const totalMinted = await contract.totalMinted();
      const nftPromises: Promise<LiveNFT | null>[] = [];

      // Load each NFT
      for (let i = 0; i < Number(totalMinted); i++) {
        nftPromises.push(
          (async () => {
            try {
              const [tokenURI, owner] = await Promise.all([
                contract.tokenURI(i),
                contract.ownerOf(i),
              ]);

              // Fetch metadata from IPFS
              const metadata = await fetchMetadata(tokenURI);

              // Get chain info for the owner
              let chainInfo;
              try {
                const holderChain = await contract.getHolderOriginChain(owner);
                chainInfo = {
                  chainNamespace: holderChain[0],
                  chainId: holderChain[1],
                  isUEA: holderChain[2],
                };
              } catch (e) {
                // Chain info not available
                chainInfo = undefined;
              }

              return {
                tokenId: i.toString(),
                owner,
                tokenURI,
                metadata,
                chainInfo,
              };
            } catch (error) {
              console.error(`Error loading NFT ${i}:`, error);
              return null;
            }
          })()
        );
      }

      const loadedNFTs = await Promise.all(nftPromises);
      const validNFTs = loadedNFTs.filter((nft): nft is LiveNFT => nft !== null);

      setNfts(validNFTs);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading NFTs:", error);
      setError(error.message || "Failed to load NFTs");
      setIsLoading(false);
    }
  }, [contractAddress, getProvider]);

  // Get NFTs owned by a specific address
  const getNFTsByOwner = useCallback(
    (ownerAddress: string): LiveNFT[] => {
      return nfts.filter(
        (nft) => nft.owner.toLowerCase() === ownerAddress.toLowerCase()
      );
    },
    [nfts]
  );

  // Get a specific NFT by token ID
  const getNFTByTokenId = useCallback(
    (tokenId: string): LiveNFT | undefined => {
      return nfts.find((nft) => nft.tokenId === tokenId);
    },
    [nfts]
  );

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([loadCollectionStats(), loadNFTs()]);
  }, [loadCollectionStats, loadNFTs]);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      await loadCollectionStats();
      await loadNFTs();
    };
    init();
  }, [loadCollectionStats, loadNFTs]);

  return {
    nfts,
    stats,
    isLoading,
    error,
    refresh,
    getNFTsByOwner,
    getNFTByTokenId,
    getIPFSUrl,
  };
};