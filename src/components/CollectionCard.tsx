import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Collection } from "@/data/mockData";

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <Link to={`/collection/${collection.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={collection.banner} 
            alt={collection.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <img 
              src={collection.avatar} 
              alt={collection.name}
              className="h-12 w-12 rounded-lg border-2 border-background"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold truncate">{collection.name}</h3>
                {collection.verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">by {collection.creator}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Floor</p>
              <p className="font-semibold">{collection.floorPrice} ETH</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Volume</p>
              <p className="font-semibold">{collection.totalVolume} ETH</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Items</p>
              <p className="font-semibold">{collection.items.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
