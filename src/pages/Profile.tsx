import { nfts } from "@/data/mockData";
import NFTCard from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Settings } from "lucide-react";
import { usePushWalletContext } from "@pushchain/ui-kit";

const Profile = () => {
  const { connectionStatus } = usePushWalletContext();
  
  const userNFTs = nfts.slice(-3); // Last 3 NFTs as user's collection
  
  // Mock address for display
  const address = "0x6639edb90ba4407a36e0d8ce2d9168a0d4844776";

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="container px-4">
        <div className="relative -mt-16 mb-8">
          <div className="h-32 w-32 rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
              </h1>
              <p className="text-muted-foreground">
                Joined Mar 2025
              </p>
            </div>
            
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-8 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">$4.92</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NFTs</p>
              <p className="text-2xl font-bold">{userNFTs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="nfts" className="mb-8">
          <TabsList>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="nfts" className="mt-6">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for items" 
                  className="pl-9"
                />
              </div>
              
              <Button variant="outline">Recently received</Button>
            </div>

            {/* Status Filters */}
            <div className="mb-6">
              <Tabs defaultValue="all">
                <TabsList variant="secondary">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="listed">Listed</TabsTrigger>
                  <TabsTrigger value="not-listed">Not Listed</TabsTrigger>
                  <TabsTrigger value="hidden">Hidden</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              {userNFTs.length} items
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
