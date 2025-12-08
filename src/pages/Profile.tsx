import { useState, useEffect } from "react";
import { usePushChainClient, usePushWalletContext } from "@pushchain/ui-kit";
import { useNFTCollection } from "@/hooks/useNFTCollection";
import { useMarketplace } from "@/hooks/useMarketplace";
import { usePNSMarketplace } from "@/hooks/usePNSMarketplace";
import NFTCard from "@/components/NFTCard";
import ListNFTDialog from "@/components/ListNFTDialog";
import ListPNSNameDialog from "@/components/ListPNSNameDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Settings, Plus, Wallet, TrendingUp, Globe } from "lucide-react";
import { DIVINITY_NFT_ADDRESS } from "@/config/nft";

const Profile = () => {
  const { pushChainClient, isInitialized } = usePushChainClient();
  const { universalAccount } = usePushWalletContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("nfts");

  const account = universalAccount;

  // Load user's NFTs from DIVINITY collection
  const {
    nfts: allNFTs,
    isLoading: nftsLoading,
    refresh: refreshNFTs,
    getNFTsByOwner,
  } = useNFTCollection(DIVINITY_NFT_ADDRESS);

  // Load marketplace data
  const { listings, cancelListing, isLoading: marketplaceLoading } = useMarketplace();

  // Load PNS names
  const { myNames, isLoading: pnsLoading, fetchMyNames } = usePNSMarketplace();

  // Get address
  const address = pushChainClient?.universal?.account || account?.address || null;

  // Fetch PNS names when address changes
  useEffect(() => {
    if (address) {
      fetchMyNames(address);
    }
  }, [address, fetchMyNames]);

  // Get user's NFTs
  const userNFTs = address ? getNFTsByOwner(address) : [];

  // Get user's active listings
  const userListings = address
    ? listings.filter(
      (listing) =>
        listing.seller.toLowerCase() === address.toLowerCase() &&
        listing.active
    )
    : [];

  // Get user's PNS listings
  const pnsListings = userListings.filter(l => l.isPNSName);

  // Filter NFTs by search
  const filteredNFTs = userNFTs.filter((nft) =>
    nft.metadata.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate portfolio value (mock for now)
  const portfolioValue = userNFTs.length * 0.01;
  const totalListings = userListings.length;

  if (!isInitialized || !address) {
    return (
      <div className="min-h-screen">
        {/* Profile Header - Not Connected */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </div>

        <div className="container px-4">
          <div className="relative -mt-16 mb-8">
            <div className="h-32 w-32 rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          </div>

          <div className="max-w-md mx-auto text-center py-12">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your NFT collection and manage your listings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="container px-4">
        <div className="relative -mt-16 mb-8">
          <div className="h-32 w-32 rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-4xl">
              {address.slice(2, 4).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </h1>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <p className="text-muted-foreground">Push Chain Wallet</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">${portfolioValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NFTs</p>
              <p className="text-2xl font-bold">{userNFTs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PNS Names</p>
              <p className="text-2xl font-bold">{myNames.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listed</p>
              <p className="text-2xl font-bold">{totalListings}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="nfts">
                NFTs ({userNFTs.length})
              </TabsTrigger>
              <TabsTrigger value="pns">
                PNS Names ({myNames.length})
              </TabsTrigger>
              <TabsTrigger value="listings">
                Listings ({userListings.length})
              </TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NFTs..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* NFTs Tab */}
          <TabsContent value="nfts">
            {/* Status Filters */}
            <div className="mb-6">
              <Tabs defaultValue="all">
                <TabsList variant="secondary">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="listed">Listed</TabsTrigger>
                  <TabsTrigger value="not-listed">Not Listed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {nftsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredNFTs.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No NFTs match your search"
                    : "You don't own any NFTs from this collection yet"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = `/collection/${DIVINITY_NFT_ADDRESS}`}>
                    Explore DIVINITY Collection
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {filteredNFTs.length} items
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredNFTs.map((nft) => {
                    const existingListing = userListings.find(
                      (l) => l.tokenId === nft.tokenId
                    );

                    return (
                      <Card key={nft.tokenId} className="group overflow-hidden">
                        <div className="relative aspect-square overflow-hidden bg-secondary">
                          <img
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          {existingListing && (
                            <Badge className="absolute top-2 right-2">Listed</Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-2 truncate">
                            {nft.metadata.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Token ID: {nft.tokenId}
                          </p>

                          {existingListing ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Listed Price
                                </span>
                                <span className="font-semibold">
                                  {existingListing.price} ETH
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => cancelListing(existingListing.id)}
                                disabled={marketplaceLoading}
                              >
                                Cancel Listing
                              </Button>
                            </div>
                          ) : (
                            <ListNFTDialog
                              tokenId={nft.tokenId}
                              tokenContract={DIVINITY_NFT_ADDRESS}
                              tokenName={nft.metadata.name}
                              tokenImage={nft.metadata.image}
                              onSuccess={refreshNFTs}
                            >
                              <Button variant="default" size="sm" className="w-full">
                                List for Sale
                              </Button>
                            </ListNFTDialog>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* PNS Names Tab */}
          <TabsContent value="pns">
            {pnsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : myNames.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No PNS Names</h3>
                <p className="text-muted-foreground mb-6">
                  You don't own any PNS names yet
                </p>
                <Button onClick={() => window.location.href = "https://universal-name-service.vercel.app/"}>
                  Register a Name
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {myNames.length} names
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {myNames.map((pnsName) => {
                    const existingListing = pnsListings.find(
                      (l) => l.tokenId === pnsName.tokenId
                    );

                    return (
                      <Card key={pnsName.tokenId} className="group overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center">
                          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                          <Globe className="h-12 w-12 text-primary/60 relative z-10" />
                          {existingListing && (
                            <Badge className="absolute top-2 right-2">Listed</Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1 truncate">
                            {pnsName.name}.push
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Expires in {Math.floor((pnsName.expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </p>

                          {existingListing ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Listed Price
                                </span>
                                <span className="font-semibold">
                                  {existingListing.price} ETH
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => cancelListing(existingListing.id)}
                                disabled={marketplaceLoading}
                              >
                                Cancel Listing
                              </Button>
                            </div>
                          ) : (
                            <ListPNSNameDialog
                              name={pnsName}
                              onSuccess={() => {
                                // Refresh PNS names and listings
                                if (address) {
                                  fetchMyNames(address);
                                }
                              }}
                            >
                              <Button variant="default" size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                List for Sale
                              </Button>
                            </ListPNSNameDialog>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            {userListings.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Listings</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't listed any NFTs for sale yet
                </p>
                <Button onClick={() => setActiveTab("nfts")}>
                  List an NFT
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <Card key={listing.id} className="p-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={listing.metadata?.image || ""}
                        alt={listing.metadata?.name || `Token #${listing.tokenId}`}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {listing.metadata?.name || `Token #${listing.tokenId}`}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Token ID: {listing.tokenId}
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge variant={listing.isAuction ? "default" : "secondary"}>
                            {listing.isAuction ? "Auction" : "Fixed Price"}
                          </Badge>
                          <span className="font-semibold text-lg">
                            {listing.price} ETH
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => cancelListing(listing.id)}
                        disabled={marketplaceLoading}
                      >
                        Cancel Listing
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Token balances coming soon...</p>
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Offers feature coming soon...</p>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Activity history coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;