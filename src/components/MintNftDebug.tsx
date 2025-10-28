import { useState, useEffect } from "react";
import {
  usePushChainClient,
  usePushWalletContext,
  usePushChain,
} from "@pushchain/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DIVINITY_NFT_ADDRESS, DIVINITY_NFT_ABI } from "@/config/nft";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

const MintNftDebug = () => {
  const { pushChainClient, isInitialized } = usePushChainClient();
  const { universalAccount } = usePushWalletContext();
  const { toast } = useToast();
    const { PushChain } = usePushChain();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [contractInfo, setContractInfo] = useState<any>({});

  const address = universalAccount?.address || null;

  // Check contract state
  useEffect(() => {
    const checkContract = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          "https://evm.rpc-testnet-donut-node1.push.org/"
        );
        const contract = new ethers.Contract(
          DIVINITY_NFT_ADDRESS,
          DIVINITY_NFT_ABI,
          provider
        );

        const [
          totalMinted,
          maxSupply,
          mintPrice,
          mintingEnabled,
          owner,
        ] = await Promise.all([
          contract.totalMinted(),
          contract.MAX_SUPPLY(),
          contract.mintPrice(),
          contract.mintingEnabled(),
          contract.owner(),
        ]);

        setContractInfo({
          totalMinted: totalMinted.toString(),
          maxSupply: maxSupply.toString(),
          mintPrice: ethers.formatEther(mintPrice),
          mintingEnabled,
          owner,
          contractAddress: DIVINITY_NFT_ADDRESS,
        });

        console.log("Contract Info:", {
          totalMinted: totalMinted.toString(),
          maxSupply: maxSupply.toString(),
          mintPrice: ethers.formatEther(mintPrice),
          mintingEnabled,
          owner,
        });
      } catch (error: any) {
        console.error("Error checking contract:", error);
        setContractInfo({ error: error.message });
      }
    };

    if (address) {
      checkContract();
    }
  }, [address]);

  const handleMint = async () => {
    if (!isInitialized || !address || !pushChainClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setDebugInfo({});

      // Method 1: Using ethers Interface (RECOMMENDED)
      const iface = new ethers.Interface(DIVINITY_NFT_ABI);
      const mintData = iface.encodeFunctionData("mint", []);
      const mintPriceWei = PushChain.utils.helpers.parseUnits(contractInfo.mintPrice || "0.01", 18);
      

      setDebugInfo({
        method: "ethers.Interface",
        to: DIVINITY_NFT_ADDRESS,
        data: mintData,
        value: mintPriceWei.toString(),
        valueInEth: ethers.formatEther(mintPriceWei),
        userAddress: address,
        contractState: contractInfo,
      });

      console.log("=== MINT DEBUG INFO ===");
      console.log("To:", DIVINITY_NFT_ADDRESS);
      console.log("Data:", mintData);
      console.log("Value (wei):", mintPriceWei.toString());
      console.log("Value (ETH):", ethers.formatEther(mintPriceWei));
      console.log("User Address:", address);
      console.log("Minting Enabled:", contractInfo.mintingEnabled);
      console.log("======================");

      toast({
        title: "Sending Transaction",
        description: "Check console for debug info...",
      });

      // Send transaction
      const tx = await pushChainClient.universal.sendTransaction({
        to: DIVINITY_NFT_ADDRESS as `0x${string}`,
        data: mintData as `0x${string}`,
        value: mintPriceWei,
      });

      console.log("Transaction sent:", tx.hash);
      setDebugInfo((prev: any) => ({ ...prev, txHash: tx.hash }));

      toast({
        title: "Transaction Submitted",
        description: `Hash: ${tx.hash.slice(0, 10)}...`,
      });

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      // Parse the NFTMinted event
      const parseIface = new ethers.Interface(DIVINITY_NFT_ABI);
      let tokenId = null;
      
      for (const log of receipt.logs) {
        try {
          const parsed = parseIface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          
          if (parsed && parsed.name === "NFTMinted") {
            tokenId = parsed.args[0].toString();
            break;
          }
        } catch (err) {
          continue;
        }
      }

      setDebugInfo((prev: any) => ({ 
        ...prev, 
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber.toString(),
        tokenId: tokenId,
        status: "Minted Successfully!"
      }));

      toast({
        title: "Success! 🎉",
        description: tokenId ? `NFT #${tokenId} minted!` : "NFT minted successfully!",
      });

    } catch (error: any) {
      console.error("=== MINT ERROR ===");
      console.error("Full error:", error);
      console.error("Error message:", error?.message);
      console.error("Error code:", error?.code);
      console.error("Error data:", error?.data);
      console.error("==================");

      setDebugInfo((prev: any) => ({
        ...prev,
        error: {
          message: error?.message,
          code: error?.code,
          data: error?.data,
          fullError: JSON.stringify(error, null, 2),
        },
      }));

      let errorMsg = "Transaction failed";
      
      if (error?.message?.includes("insufficient")) {
        errorMsg = "Insufficient funds";
      } else if (error?.message?.includes("user rejected")) {
        errorMsg = "Transaction rejected";
      } else if (error?.message?.includes("0x64a0ae92")) {
        errorMsg = "Contract execution reverted. Possible reasons:\n" +
                   "1. Minting not enabled\n" +
                   "2. Max supply reached\n" + 
                   "3. Incorrect payment amount\n" +
                   "4. Universal Account issue";
      }

      toast({
        title: "Minting Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Mint NFT - Debug Mode</h1>

        {/* Contract Info */}
        <div className="mb-6 p-4 bg-secondary rounded-lg">
          <h3 className="font-semibold mb-3">Contract State:</h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span>Address:</span>
              <span className="text-primary">{contractInfo.contractAddress}</span>
            </div>
            <div className="flex justify-between">
              <span>Minting Enabled:</span>
              <span className={contractInfo.mintingEnabled ? "text-green-500" : "text-red-500"}>
                {contractInfo.mintingEnabled ? "YES ✓" : "NO ✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Minted:</span>
              <span>{contractInfo.totalMinted} / {contractInfo.maxSupply}</span>
            </div>
            <div className="flex justify-between">
              <span>Mint Price:</span>
              <span>{contractInfo.mintPrice} ETH</span>
            </div>
            <div className="flex justify-between">
              <span>Owner:</span>
              <span className="text-xs">{contractInfo.owner}</span>
            </div>
            {contractInfo.error && (
              <div className="text-red-500">Error: {contractInfo.error}</div>
            )}
          </div>
        </div>

        {/* Wallet Info */}
        {address && (
          <div className="mb-6 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-3">Wallet Info:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>Connected:</span>
                <span className="text-green-500">YES ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-xs">{address}</span>
              </div>
              <div className="flex justify-between">
                <span>Is Owner:</span>
                <span className={address.toLowerCase() === contractInfo.owner?.toLowerCase() ? "text-green-500" : "text-muted-foreground"}>
                  {address.toLowerCase() === contractInfo.owner?.toLowerCase() ? "YES" : "NO"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mint Button */}
        <Button
          onClick={handleMint}
          disabled={isLoading || !address || !contractInfo.mintingEnabled}
          size="lg"
          className="w-full mb-6"
        >
          {isLoading ? "Minting..." : "Mint NFT (Debug)"}
        </Button>

        {/* Debug Info */}
        {Object.keys(debugInfo).length > 0 && (
          <div className="p-4 bg-black text-green-400 rounded-lg overflow-auto">
            <h3 className="font-semibold mb-3">Debug Output:</h3>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Debug Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Check if "Minting Enabled" is YES</li>
            <li>Make sure you have enough balance</li>
            <li>Click "Mint NFT" and watch the console</li>
            <li>Check the debug output below for error details</li>
            <li>If error 0x64a0ae92 appears, minting might actually be disabled</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default MintNftDebug;