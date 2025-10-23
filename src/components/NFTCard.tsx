import { Card } from "@/components/ui/card";
import { NFT } from "@/data/mockData";

interface NFTCardProps {
  nft: NFT;
}

const NFTCard = ({ nft }: NFTCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img 
          src={nft.image} 
          alt={nft.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold mb-2 truncate">{nft.name}</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-semibold">{nft.price} ETH</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NFTCard;
