import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { PNS_REGISTRY_ADDRESS, PNS_REGISTRY_ABI } from "@/config/pns";
import { MARKETPLACE_ADDRESS } from "@/config/marketplace";
import { usePushChainClient } from "@pushchain/ui-kit";
import { useToast } from "@/hooks/use-toast";
import { PNSClient, PNSNetwork } from "@miracleorg/pns-sdk";
import { useMarketplace } from "@/hooks/useMarketplace";

export interface PNSName {
    name: string;
    expiresAt: number;
    isPremium: boolean;
    tokenId: string;
}

export const usePNSMarketplace = () => {
    const [myNames, setMyNames] = useState<PNSName[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { pushChainClient } = usePushChainClient();
    const { toast } = useToast();
    const { listItem } = useMarketplace();

    // Get read-only provider
    const getProvider = useCallback(() => {
        return new ethers.JsonRpcProvider("https://evm.donut.rpc.push.org/");
    }, []);

    // Fetch user's PNS names
    const fetchMyNames = useCallback(async (address: string) => {
        try {
            setIsLoading(true);
            const provider = getProvider();

            // Initialize PNS SDK
            const pns = await PNSClient.initialize(provider, {
                network: PNSNetwork.TESTNET,
            });

            // Get names owned by address
            const names = await pns.getNamesByOwner(address);

            const namesWithDetails = await Promise.all(
                names.map(async (name) => {
                    const record = await pns.getNameRecord(name);
                    // Calculate token ID (name hash) using ethers
                    const nameHash = ethers.keccak256(ethers.toUtf8Bytes(name));

                    return {
                        name,
                        expiresAt: Number(record.expiresAt), // Convert bigint to number
                        isPremium: record.isPremium,
                        tokenId: nameHash,
                    };
                })
            );

            setMyNames(namesWithDetails);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching PNS names:", error);
            setIsLoading(false);
        }
    }, [getProvider]);

    // List a PNS name directly (no wrapping needed!)
    const listPNSName = useCallback(
        async (name: string, tokenId: string, price: string) => {
            if (!pushChainClient) {
                toast({
                    title: "Wallet Not Connected",
                    description: "Please connect your wallet first",
                    variant: "destructive",
                });
                return;
            }

            const userAddress = pushChainClient?.universal?.account;
            if (!userAddress) {
                toast({
                    title: "Address Not Found",
                    description: "Could not get wallet address",
                    variant: "destructive",
                });
                return;
            }

            try {
                setIsLoading(true);

                // Step 1: Transfer PNS token to marketplace (escrow model)
                toast({
                    title: "Transfer Required",
                    description: `Transferring ${name}.push to marketplace...`,
                });

                const pnsInterface = new ethers.Interface(PNS_REGISTRY_ABI);
                const tokenIdBigInt = BigInt(tokenId);

                const transferData = pnsInterface.encodeFunctionData("transferFrom", [
                    userAddress, // from (current owner)
                    MARKETPLACE_ADDRESS, // to (marketplace)
                    tokenIdBigInt,
                ]) as `0x${string}`;

                const transferTx = await pushChainClient.universal.sendTransaction({
                    to: PNS_REGISTRY_ADDRESS as `0x${string}`,
                    data: transferData,
                    value: BigInt(0),
                });

                await transferTx.wait();

                toast({
                    title: "Transferred!",
                    description: "Now listing on marketplace...",
                });

                // Step 2: List on marketplace
                console.log('🔍 PNS Listing Debug:');
                console.log('  tokenId (hex):', tokenId);
                console.log('  tokenIdBigInt:', tokenIdBigInt);
                console.log('  tokenIdBigInt.toString():', tokenIdBigInt.toString());
                console.log('  typeof tokenIdBigInt:', typeof tokenIdBigInt);

                await listItem(
                    PNS_REGISTRY_ADDRESS,
                    tokenIdBigInt,
                    1, // amount (ERC721 = 1)
                    price,
                    false, // not auction
                    0 // no auction end time
                );

                toast({
                    title: "Success!",
                    description: `${name}.push is now listed on the marketplace!`,
                });

                setIsLoading(false);
            } catch (error: any) {
                console.error("Error listing name:", error);
                console.error("Error details:", {
                    message: error?.message,
                    code: error?.code,
                    data: error?.data,
                    stack: error?.stack
                });
                toast({
                    title: "Error",
                    description: error?.message || error?.reason || "Failed to list name. Check console for details.",
                    variant: "destructive",
                });
                setIsLoading(false);
            }
        },
        [pushChainClient, toast, listItem]
    );

    return {
        myNames,
        isLoading,
        fetchMyNames,
        listPNSName,
    };
};
