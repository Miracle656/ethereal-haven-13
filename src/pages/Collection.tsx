import { useParams } from "react-router-dom";
import { collections, nfts } from "@/data/mockData";
import NFTCard from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Globe, Search, Settings2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Collection = () => {
  const { id } = useParams();
  const collection = collections.find((c) => c.id === id);
  const collectionNFTs = nfts.filter((nft) => nft.collectionId === id);

  if (!collection) {
    return <div className="container py-12">Collection not found</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={collection.banner}
          alt={collection.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Collection Info */}
      <div className="container px-4">
        <div className="relative -mt-16 mb-8">
          <img 
            src={collection.avatar}
            alt={collection.name}
            className="h-32 w-32 rounded-xl border-4 border-background"
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-bold">{collection.name}</h1>
            {collection.verified && (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span>By {collection.creator}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {collection.blockchain}
            </span>
            <span>•</span>
            <span>{collection.items.toLocaleString()} items</span>
          </div>

          <p className="text-muted-foreground max-w-3xl mb-6">
            {collection.description}
          </p>

          <div className="flex flex-wrap gap-8 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Floor Price</p>
              <p className="text-2xl font-bold">{collection.floorPrice} ETH</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Offer</p>
              <p className="text-2xl font-bold">—</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{collection.totalVolume} ETH</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="mb-8">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <TabsTrigger value="traits">Traits</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters and Items */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by item or trait" 
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select defaultValue="price-low">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="recent">Recently Listed</SelectItem>
                  <SelectItem value="rare">Most Rare</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            {collectionNFTs.length} items
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {collectionNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
