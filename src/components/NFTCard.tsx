import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NFT } from "@/data/mockData";
import { Listing } from "@/hooks/useMarketplace";
import { ShoppingCart, Tag } from "lucide-react";

interface NFTCardProps {
  nft?: NFT;
  listing?: Listing;
  onBuy?: (listingId: string) => void;
  isLoading?: boolean;
}

const NFTCard = ({ nft, listing, onBuy, isLoading }: NFTCardProps) => {
  // Use either mock data or real listing data
  const displayData = listing
    ? {
        name: `Token #${listing.tokenId}`,
        image: nft?.image || "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop",
        price: listing.price,
        id: listing.id,
      }
    : nft
    ? {
        name: nft.name,
        image: nft.image,
        price: nft.price,
        id: nft.id,
      }
    : null;

  if (!displayData) return null;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing && onBuy) {
      onBuy(listing.id);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img 
          src={displayData.image} 
          alt={displayData.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {listing?.isAuction && (
          <div className="absolute top-2 right-2 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <Tag className="h-3 w-3 inline mr-1" />
            <span className="text-xs font-semibold">Auction</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold mb-2 truncate">{displayData.name}</h4>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-semibold">{displayData.price} ETH</p>
          </div>
        </div>
        
        {listing && onBuy && (
          <Button 
            onClick={handleBuy}
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : "Buy Now"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default NFTCard;
