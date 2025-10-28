import { useState } from "react";
import { useParams } from "react-router-dom";
import { collections, nfts as mockNfts } from "@/data/mockData";
import NFTCard from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Globe, Search, Settings2, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useNFTCollection } from "@/hooks/useNFTCollection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Collection = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-low");
  
  // Determine if it's a live on-chain collection
  const isLiveCollection = id?.startsWith("0x");
  
  // Get mock collection data
  const mockCollection = collections.find((c) => c.id === id);
  const mockCollectionNFTs = mockNfts.filter((nft) => nft.collectionId === id);
  
  // Load live NFTs if it's an on-chain collection
  const {
    nfts: liveNFTs,
    stats: liveStats,
    isLoading: nftsLoading,
    error: nftsError,
    refresh: refreshNFTs,
  } = useNFTCollection(isLiveCollection ? id! : undefined);
  
  // Load marketplace listings
  const { listings, isLoading: listingsLoading, buyItem } = useMarketplace();

  // Filter listings for this collection
  const collectionListings = isLiveCollection
    ? listings.filter((listing) => listing.tokenContract.toLowerCase() === id?.toLowerCase())
    : [];

  // Determine what data to display
  const collection = isLiveCollection
    ? {
        id: id!,
        name: liveStats ? "DIVINITY" : "Loading...",
        creator: "divinity.push",
        description: "A unique DIVINE collection of digital arts.",
        banner: mockCollection?.banner || "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=1200&h=400&fit=crop",
        avatar: mockCollection?.avatar || "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&h=200&fit=crop",
        floorPrice: liveStats?.floorPrice || "—",
        totalVolume: "—",
        items: liveStats?.totalMinted || 0,
        listed: collectionListings.length.toString(),
        verified: true,
        blockchain: "Push Chain",
      }
    : mockCollection;

  const displayNFTs = isLiveCollection ? liveNFTs : mockCollectionNFTs;
  const isLoading = isLiveCollection ? nftsLoading : false;

  // Filter and sort NFTs
  const filteredNFTs = displayNFTs.filter((nft) => {
    const metadata = "metadata" in nft ? nft.metadata : nft;
    return metadata.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    const aListing = collectionListings.find((l) => 
      "tokenId" in a && l.tokenId === a.tokenId
    );
    const bListing = collectionListings.find((l) => 
      "tokenId" in b && l.tokenId === b.tokenId
    );

    if (sortBy === "price-low") {
      const aPrice = aListing ? parseFloat(aListing.price) : 999999;
      const bPrice = bListing ? parseFloat(bListing.price) : 999999;
      return aPrice - bPrice;
    } else if (sortBy === "price-high") {
      const aPrice = aListing ? parseFloat(aListing.price) : 0;
      const bPrice = bListing ? parseFloat(bListing.price) : 0;
      return bPrice - aPrice;
    } else if (sortBy === "recent") {
      return "tokenId" in b ? parseInt(b.tokenId) - parseInt((a as any).tokenId || "0") : 0;
    }
    return 0;
  });

  if (!collection) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Collection not found</p>
      </div>
    );
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
            {isLiveCollection && (
              <Badge variant="secondary" className="ml-2">
                Live Collection
              </Badge>
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
            <span>{collection.items} items</span>
            {isLiveCollection && liveStats && (
              <>
                <span>•</span>
                <span>{liveStats.remaining} remaining</span>
              </>
            )}
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
              <p className="text-sm text-muted-foreground">Listed</p>
              <p className="text-2xl font-bold">{collection.listed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{collection.totalVolume} ETH</p>
            </div>
            {isLiveCollection && liveStats && (
              <div>
                <p className="text-sm text-muted-foreground">Mint Price</p>
                <p className="text-2xl font-bold">{liveStats.mintPrice} ETH</p>
              </div>
            )}
          </div>

          {/* Chain Stats for Live Collections */}
          {isLiveCollection && liveStats && (
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge variant="outline">
                🔷 Ethereum: {liveStats.mintsFromEthereum}
              </Badge>
              <Badge variant="outline">
                ◎ Solana: {liveStats.mintsFromSolana}
              </Badge>
              <Badge variant="outline">
                🔺 Push Chain: {liveStats.mintsFromPushChain}
              </Badge>
              <Badge variant="outline">
                🌐 Other Chains: {liveStats.mintsFromOtherChains}
              </Badge>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="mb-8">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {isLiveCollection && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="items">
            {/* Filters and Search */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by item or trait"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="recent">Recently Minted</SelectItem>
                    </SelectContent>
                  </Select>

                  {isLiveCollection && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={refreshNFTs}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  )}

                  <Button variant="outline" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {nftsError && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive">Error loading NFTs: {nftsError}</p>
                </div>
              )}

              {/* Items Count */}
              <div className="mb-4 text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading items..."
                ) : collectionListings.length > 0 ? (
                  `${collectionListings.length} listed • ${displayNFTs.length} total items`
                ) : (
                  `${displayNFTs.length} items`
                )}
              </div>

              {/* NFT Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {sortedNFTs.map((nft) => {
                    const listing = "tokenId" in nft
                      ? collectionListings.find((l) => l.tokenId === nft.tokenId)
                      : undefined;

                    return (
                      <NFTCard
                        key={"tokenId" in nft ? nft.tokenId : nft.id}
                        nft={
                          "metadata" in nft
                            ? {
                                id: nft.tokenId,
                                name: nft.metadata.name,
                                image: nft.metadata.image,
                                price: listing?.price || "Not Listed",
                                collectionId: id!,
                                description: nft.metadata.description,
                              }
                            : nft
                        }
                        listing={listing}
                        onBuy={listing ? buyItem : undefined}
                        isLoading={listingsLoading}
                      />
                    );
                  })}
                </div>
              )}

              {!isLoading && sortedNFTs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No items found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="py-8 text-center text-muted-foreground">
              Activity feed coming soon...
            </div>
          </TabsContent>

          {isLiveCollection && (
            <TabsContent value="analytics">
              <div className="py-8">
                <h3 className="text-2xl font-bold mb-6">Collection Analytics</h3>
                {liveStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 border rounded-lg">
                      <h4 className="font-semibold mb-2">Minting Progress</h4>
                      <div className="text-3xl font-bold mb-2">
                        {liveStats.totalMinted} / {liveStats.maxSupply}
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(liveStats.totalMinted / liveStats.maxSupply) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h4 className="font-semibold mb-2">Cross-Chain Distribution</h4>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Ethereum</span>
                          <span className="font-semibold">{liveStats.mintsFromEthereum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Solana</span>
                          <span className="font-semibold">{liveStats.mintsFromSolana}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Push Chain</span>
                          <span className="font-semibold">{liveStats.mintsFromPushChain}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h4 className="font-semibold mb-2">Marketplace</h4>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Listed Items</span>
                          <span className="font-semibold">{collectionListings.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Floor Price</span>
                          <span className="font-semibold">{collection.floorPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Collection;