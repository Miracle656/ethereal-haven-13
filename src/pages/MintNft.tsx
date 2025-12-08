import { useState, useEffect } from "react";
import {
  usePushChainClient,
  usePushWalletContext,
} from "@pushchain/ui-kit";
import { useNFTCollection } from "@/hooks/useNFTCollection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Wallet,
  Check,
  Loader2,
  ExternalLink,
  AlertCircle,
  Zap
} from "lucide-react";
import { DIVINITY_NFT_ADDRESS, DIVINITY_NFT_ABI } from "@/config/nft";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

const MintNft = () => {
  const { pushChainClient, isInitialized } = usePushChainClient();
  const { universalAccount } = usePushWalletContext();
  const { stats, refresh } = useNFTCollection(DIVINITY_NFT_ADDRESS);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [mintedTokenId, setMintedTokenId] = useState<string>("");
  const [minterAddress, setMinterAddress] = useState<string>("");
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");

  // Get address
  const address = universalAccount?.address || null;

  // Calculate progress
  const mintProgress = stats
    ? (stats.totalMinted / stats.maxSupply) * 100
    : 0;

  const handleMint = async () => {
    if (!isInitialized || !address || !pushChainClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint",
        variant: "destructive",
      });
      return;
    }

    if (!stats?.mintingEnabled) {
      toast({
        title: "Minting Disabled",
        description: "Minting is currently disabled for this collection",
        variant: "destructive",
      });
      return;
    }

    if (stats.totalMinted >= stats.maxSupply) {
      toast({
        title: "Sold Out",
        description: "All NFTs have been minted",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setMintStatus("minting");
      setTxHash("");
      setMintedTokenId("");

      toast({
        title: "Minting NFT",
        description: "Please confirm the transaction in your wallet...",
      });

      // Encode the mint function call
      const iface = new ethers.Interface(DIVINITY_NFT_ABI);
      const mintData = iface.encodeFunctionData("mint", []);

      // CRITICAL FIX: Parse mint price from stats.mintPrice string to Wei
      // If stats.mintPrice is "0.01", convert to 10000000000000000 wei
      const mintPriceInEther = stats?.mintPrice || "0.01";
      const mintPriceWei = BigInt(ethers.parseEther(mintPriceInEther).toString());

      console.log("🎨 Minting NFT with params:", {
        to: DIVINITY_NFT_ADDRESS,
        value: mintPriceWei.toString(),
        data: mintData,
        mintPriceInEther,
      });

      // Send transaction - EXACTLY like PNS does
      const tx = await pushChainClient.universal.sendTransaction({
        to: DIVINITY_NFT_ADDRESS as `0x${string}`,
        data: mintData as `0x${string}`,
        value: mintPriceWei,
      });

      setTxHash(tx.hash);

      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      // Wait for transaction receipt
      const receipt = await tx.wait();

      console.log("✅ Transaction confirmed:", receipt);

      // Parse the NFTMinted event from the receipt
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsed && parsed.name === "NFTMinted") {
            const tokenId = parsed.args[0].toString();
            const minter = parsed.args[1];
            const chainNamespace = parsed.args[2];
            const chainId = parsed.args[3];

            setMintedTokenId(tokenId);
            setMinterAddress(minter);
            setChainInfo({
              chainNamespace,
              chainId,
            });

            setMintStatus("success");

            toast({
              title: "NFT Minted Successfully! 🎉",
              description: `Token ID: ${tokenId}`,
            });

            // Refresh collection stats
            await refresh();
            break;
          }
        } catch (err) {
          // Ignore logs that don't match
          continue;
        }
      }

      if (!mintedTokenId && mintStatus !== "success") {
        // Transaction succeeded but couldn't parse event - still success!
        setMintStatus("success");
        setMintedTokenId("Unknown");
        toast({
          title: "Transaction Confirmed! 🎉",
          description: "NFT minted successfully! Check your profile.",
        });
        await refresh();
      }

    } catch (error: any) {
      console.error("❌ Minting failed:", error);
      setMintStatus("error");

      let errorMessage = "Transaction failed. Please try again.";

      if (error?.message?.includes("insufficient")) {
        errorMessage = "Insufficient funds to mint NFT";
      } else if (error?.message?.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (error?.message?.includes("Minting is not enabled")) {
        errorMessage = "Minting is currently disabled";
      } else if (error?.message?.includes("Max supply reached")) {
        errorMessage = "Collection is sold out";
      } else if (error?.message?.includes("Insufficient payment")) {
        errorMessage = "Insufficient payment sent";
      }

      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMint = () => {
    setMintStatus("idle");
    setTxHash("");
    setMintedTokenId("");
    setMinterAddress("");
    setChainInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">DIVINITY NFT Collection</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mint Your NFT
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the DIVINITY collection and own a unique piece of digital art on Push Chain
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Mint Price</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats?.mintPrice || "0.01"} ETH</p>
          </Card>

          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Minted</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.totalMinted || 0} / {stats?.maxSupply || 16}
            </p>
          </Card>

          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <Badge variant="secondary" className="text-xs">
                {stats?.remaining || 16} left
              </Badge>
            </div>
            <p className="text-3xl font-bold">{stats?.remaining || 16}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Collection Progress</span>
            <span className="text-sm text-muted-foreground">
              {mintProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={mintProgress} className="h-3" />
        </Card>

        {/* Main Mint Card */}
        <Card className="p-8 border-2 border-primary/20 shadow-2xl">
          {mintStatus === "idle" && (
            <div className="text-center">
              <div className="mx-auto w-32 h-32 mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-4">Ready to Mint?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Each DIVINITY NFT is unique and stored on-chain with metadata on IPFS.
                Mint from any supported chain!
              </p>

              {!address ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">Please connect your wallet to continue</p>
                  </div>
                </div>
              ) : !stats?.mintingEnabled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="text-sm">Minting is currently disabled</p>
                  </div>
                </div>
              ) : stats.totalMinted >= stats.maxSupply ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold">Collection Sold Out! 🎉</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check the marketplace for listings
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleMint}
                  disabled={isLoading}
                  className="w-full max-w-xs h-14 text-lg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Mint NFT for {stats?.mintPrice || "0.01"} ETH
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {mintStatus === "minting" && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 mb-6">
                <Loader2 className="h-20 w-20 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Minting Your NFT...</h2>
              <p className="text-muted-foreground mb-6">
                Please wait while your transaction is being processed
              </p>
              {txHash && (
                <a
                  href={`https://testnet-explorer.push.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View Transaction
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {mintStatus === "success" && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Successfully Minted! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Your NFT has been minted and is now in your wallet
              </p>

              {mintedTokenId && (
                <Card className="p-6 mb-6 bg-secondary/50 border-0">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Token ID</span>
                      <Badge variant="secondary" className="font-mono">
                        #{mintedTokenId}
                      </Badge>
                    </div>
                    {minterAddress && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Minter</span>
                        <span className="text-sm font-mono">
                          {minterAddress.slice(0, 6)}...{minterAddress.slice(-4)}
                        </span>
                      </div>
                    )}
                    {chainInfo && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Chain</span>
                        <Badge variant="outline">
                          {chainInfo.chainNamespace || "Push Chain"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {txHash && (
                <a
                  href={`https://testnet-explorer.push.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div className="flex gap-3 justify-center mt-6">
                <Button variant="outline" onClick={resetMint}>
                  Mint Another
                </Button>
                <Button onClick={() => window.location.href = "/profile"}>
                  View in Profile
                </Button>
              </div>
            </div>
          )}

          {mintStatus === "error" && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 mb-6 bg-destructive/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Minting Failed</h2>
              <p className="text-muted-foreground mb-6">
                Something went wrong. Please try again.
              </p>
              <Button onClick={resetMint}>
                Try Again
              </Button>
            </div>
          )}
        </Card>

        {/* Cross-Chain Stats */}
        {stats && (
          <Card className="p-6 mt-8">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Cross-Chain Mints
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {stats.mintsFromEthereum}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ethereum</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {stats.mintsFromSolana}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Solana</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-500">
                  {stats.mintsFromPushChain}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Push Chain</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {stats.mintsFromOtherChains}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Others</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MintNft;