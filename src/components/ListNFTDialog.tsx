import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";
import { Tag, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { usePushChainClient } from "@pushchain/ui-kit";
import { DIVINITY_NFT_ADDRESS, DIVINITY_NFT_ABI } from "@/config/nft";
import { MARKETPLACE_ADDRESS } from "@/config/marketplace";

interface ListNFTDialogProps {
  tokenId: string;
  tokenContract?: string;
  tokenName: string;
  tokenImage: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const ListNFTDialog = ({
  tokenId,
  tokenContract = DIVINITY_NFT_ADDRESS,
  tokenName,
  tokenImage,
  onSuccess,
  children,
}: ListNFTDialogProps) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [isAuction, setIsAuction] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  
  const { listItem } = useMarketplace();
  const { toast } = useToast();
  const { pushChainClient } = usePushChainClient();

  const handleApproveAndList = async () => {
    if (!pushChainClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Approve marketplace to transfer NFT
      setIsApproving(true);
      toast({
        title: "Approval Required",
        description: "Approving marketplace to list your NFT...",
      });

      const nftInterface = new ethers.Interface(DIVINITY_NFT_ABI);
      const approveData = nftInterface.encodeFunctionData("approve", [
        MARKETPLACE_ADDRESS,
        tokenId,
      ]) as `0x${string}`;

      const approveTx = await pushChainClient.universal.sendTransaction({
        to: tokenContract as `0x${string}`,
        data: approveData,
        value: BigInt(0),
      });

      await approveTx.wait();
      setIsApproving(false);

      toast({
        title: "Approved!",
        description: "Now listing your NFT...",
      });

      // Step 2: List the NFT on marketplace
      setIsListing(true);
      
      const auctionEndTime = isAuction
        ? Math.floor(Date.now() / 1000) + parseInt(auctionDuration) * 3600
        : 0;

      await listItem(
        tokenContract,
        parseInt(tokenId),
        1, // amount (ERC721 = 1)
        price,
        isAuction,
        auctionEndTime
      );

      setIsListing(false);
      setOpen(false);
      setPrice("");
      setIsAuction(false);
      setAuctionDuration("24");

      toast({
        title: "Success!",
        description: "Your NFT is now listed on the marketplace",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Error listing NFT:", error);
      setIsApproving(false);
      setIsListing(false);
      
      toast({
        title: "Error",
        description: error?.message || "Failed to list NFT",
        variant: "destructive",
      });
    }
  };

  const isProcessing = isApproving || isListing;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>
            Set your price and listing type for this NFT
          </DialogDescription>
        </DialogHeader>

        {/* NFT Preview */}
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <img
            src={tokenImage}
            alt={tokenName}
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div>
            <h4 className="font-semibold">{tokenName}</h4>
            <p className="text-sm text-muted-foreground">Token ID: {tokenId}</p>
          </div>
        </div>

        {/* Listing Form */}
        <div className="space-y-4 py-4">
          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">
              {isAuction ? "Reserve Price" : "Fixed Price"} (ETH)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Enter the price in ETH
            </p>
          </div>

          {/* Auction Toggle */}
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="auction-mode">Auction Mode</Label>
              <p className="text-sm text-muted-foreground">
                List as an auction instead of fixed price
              </p>
            </div>
            <Switch
              id="auction-mode"
              checked={isAuction}
              onCheckedChange={setIsAuction}
              disabled={isProcessing}
            />
          </div>

          {/* Auction Duration */}
          {isAuction && (
            <div className="space-y-2">
              <Label htmlFor="duration">Auction Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="24"
                value={auctionDuration}
                onChange={(e) => setAuctionDuration(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                How long the auction will run
              </p>
            </div>
          )}

          {/* Fee Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Listing Fee</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-semibold">2.5%</span>
            </div>
            {price && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold">You'll Receive</span>
                <span className="font-semibold">
                  {(parseFloat(price) * 0.975).toFixed(4)} ETH
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveAndList}
            disabled={isProcessing || !price || parseFloat(price) <= 0}
          >
            {isApproving && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            )}
            {isListing && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing...
              </>
            )}
            {!isProcessing && (
              <>
                <Tag className="mr-2 h-4 w-4" />
                List NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListNFTDialog;