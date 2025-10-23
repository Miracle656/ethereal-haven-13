import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/config/marketplace";
import { usePushChainClient, usePushWalletContext } from "@pushchain/ui-kit";
import { useToast } from "@/hooks/use-toast";

export interface Listing {
  id: string;
  seller: string;
  tokenContract: string;
  tokenType: number;
  tokenId: string;
  amount: string;
  currency: string;
  price: string;
  active: boolean;
  isAuction: boolean;
}

export const useMarketplace = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { pushChainClient } = usePushChainClient();
  const { connectionStatus } = usePushWalletContext();
  const { toast } = useToast();

  // Get read-only provider for fetching data
  const getProvider = useCallback(() => {
    return new ethers.JsonRpcProvider("https://evm.rpc-testnet-donut-node1.push.org/");
  }, []);

  // Fetch all active listings
  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

      // Fetch Listed events to get all listing IDs
      const filter = contract.filters.Listed();
      const events = await contract.queryFilter(filter, 0, "latest");

      const listingPromises = events.map(async (event) => {
        if (!('args' in event)) return null;
        const listingId = event.args?.[0];
        if (!listingId) return null;

        try {
          const listing = await contract.listings(listingId);
          
          // Only return active listings
          if (listing.active) {
            return {
              id: listingId.toString(),
              seller: listing.seller,
              tokenContract: listing.tokenContract,
              tokenType: Number(listing.tokenType),
              tokenId: listing.tokenId.toString(),
              amount: listing.amount.toString(),
              currency: listing.currency,
              price: ethers.formatEther(listing.price),
              active: listing.active,
              isAuction: listing.isAuction,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching listing ${listingId}:`, err);
          return null;
        }
      });

      const allListings = await Promise.all(listingPromises);
      const activeListings = allListings.filter((listing): listing is Listing => listing !== null);
      
      setListings(activeListings);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setIsLoading(false);
    }
  }, [getProvider]);

  // Buy an item
  const buyItem = useCallback(
    async (listingId: string, amountToBuy: number = 1) => {
      if (!pushChainClient) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        // Get listing details to calculate price
        const provider = getProvider();
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
        const listing = await contract.listings(listingId);

        const totalPrice = BigInt(listing.price) * BigInt(amountToBuy);

        // Check if currency is native (address(0))
        const isNative = listing.currency === ethers.ZeroAddress;

        const iface = new ethers.Interface(MARKETPLACE_ABI);
        const data = iface.encodeFunctionData("buyItem", [listingId, amountToBuy]) as `0x${string}`;

        const tx = await pushChainClient.universal.sendTransaction({
          to: MARKETPLACE_ADDRESS,
          data,
          value: isNative ? totalPrice : BigInt(0),
        });

        toast({
          title: "Transaction Submitted",
          description: "Waiting for confirmation...",
        });

        await tx.wait();

        toast({
          title: "Purchase Successful!",
          description: "NFT has been transferred to your wallet",
        });

        // Refresh listings
        await fetchListings();
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error buying item:", error);
        toast({
          title: "Transaction Failed",
          description: error?.message || "Failed to buy item",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [pushChainClient, toast, getProvider, fetchListings]
  );

  // List an item
  const listItem = useCallback(
    async (
      tokenContract: string,
      tokenId: number,
      amount: number,
      price: string,
      asAuction: boolean = false,
      auctionEndTime: number = 0
    ) => {
      if (!pushChainClient) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        const priceInWei = ethers.parseEther(price);
        const currency = ethers.ZeroAddress; // Native currency

        const iface = new ethers.Interface(MARKETPLACE_ABI);
        const data = iface.encodeFunctionData("listItem", [
          tokenContract,
          tokenId,
          amount,
          currency,
          priceInWei,
          asAuction,
          auctionEndTime,
        ]) as `0x${string}`;

        const tx = await pushChainClient.universal.sendTransaction({
          to: MARKETPLACE_ADDRESS,
          data,
          value: BigInt(0),
        });

        toast({
          title: "Transaction Submitted",
          description: "Listing your item...",
        });

        await tx.wait();

        toast({
          title: "Item Listed!",
          description: "Your item is now available on the marketplace",
        });

        await fetchListings();
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error listing item:", error);
        toast({
          title: "Transaction Failed",
          description: error?.message || "Failed to list item",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [pushChainClient, toast, fetchListings]
  );

  // Cancel a listing
  const cancelListing = useCallback(
    async (listingId: string) => {
      if (!pushChainClient) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);

        const iface = new ethers.Interface(MARKETPLACE_ABI);
        const data = iface.encodeFunctionData("cancelListing", [listingId]) as `0x${string}`;

        const tx = await pushChainClient.universal.sendTransaction({
          to: MARKETPLACE_ADDRESS,
          data,
          value: BigInt(0),
        });

        toast({
          title: "Transaction Submitted",
          description: "Canceling listing...",
        });

        await tx.wait();

        toast({
          title: "Listing Canceled",
          description: "Your listing has been removed",
        });

        await fetchListings();
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error canceling listing:", error);
        toast({
          title: "Transaction Failed",
          description: error?.message || "Failed to cancel listing",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [pushChainClient, toast, fetchListings]
  );

  // Load listings on mount
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    fetchListings,
    buyItem,
    listItem,
    cancelListing,
  };
};
