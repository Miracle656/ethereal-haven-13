import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Globe, Clock } from "lucide-react";
import { Listing } from "@/hooks/useMarketplace";

interface PNSNameCardProps {
    listing: Listing;
    onBuy?: (listingId: string) => void;
    isLoading?: boolean;
}

const PNSNameCard = ({ listing, onBuy, isLoading }: PNSNameCardProps) => {
    const pnsName = listing.metadata?.name || `Token #${listing.tokenId}`;
    const displayName = pnsName.endsWith(".push") ? pnsName : `${pnsName}.push`;

    // Calculate days until expiry (if available)
    const getDaysUntilExpiry = () => {
        // This would come from metadata in a real implementation
        return null;
    };

    const handleBuy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onBuy) {
            onBuy(listing.id);
        }
    };

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 bg-gradient-to-br from-background to-secondary/20">
            {/* Header with gradient */}
            <div className="relative h-32 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <Globe className="h-16 w-16 text-primary/60 relative z-10" />
            </div>

            <div className="p-4">
                {/* Name */}
                <div className="mb-3">
                    <h4 className="font-bold text-xl mb-1 truncate bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {displayName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Push Name Service
                    </p>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                    {listing.isAuction && (
                        <Badge variant="secondary" className="text-xs">
                            Auction
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Universal
                    </Badge>
                </div>

                {/* Price and Stats */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-lg">{listing.price} ETH</p>
                    </div>
                    {getDaysUntilExpiry() && (
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Expires
                            </p>
                            <p className="text-sm font-semibold">{getDaysUntilExpiry()}d</p>
                        </div>
                    )}
                </div>

                {/* Buy Button */}
                {onBuy && (
                    <Button
                        onClick={handleBuy}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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

export default PNSNameCard;
