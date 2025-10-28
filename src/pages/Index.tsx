import { collections } from "@/data/mockData";
import divinitypfp from "../assets/divinypfp.png";
collections.push({
  id: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C",
  name: "DIVINITY",
  creator: "divinity.push",
  banner: divinitypfp,
  avatar: divinitypfp,
  blockchain: "Push",
  items: 10,
  floorPrice: "—",
  totalVolume: "—",
  listed: "0",
  verified: true,
  description: "A unique DIVINE collection of digital arts.",
});

import CollectionCard from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const featuredCollection = collections[6]; // Ringers

  

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img 
          src={featuredCollection.banner}
          alt="Featured"
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        <div className="container relative z-20 h-full flex items-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{featuredCollection.name}</h1>
            <p className="text-lg text-muted-foreground mb-2">By {featuredCollection.creator}</p>
            <p className="text-lg mb-6">{featuredCollection.description}</p>
            
            <div className="flex flex-wrap gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Floor Price</p>
                <p className="text-2xl font-bold">{featuredCollection.floorPrice} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold">{featuredCollection.items.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{featuredCollection.totalVolume} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Listed</p>
                <p className="text-2xl font-bold">{featuredCollection.listed}</p>
              </div>
            </div>

            <Button size="lg">Explore Collection</Button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Collections</h2>
          <p className="text-muted-foreground">This week's curated collections</p>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="art">Art</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="pfps">PFPs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Trending Collections */}
      <section className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending</h2>
            <p className="text-muted-foreground">Top collections over the last 24 hours</p>
          </div>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.slice(0, 6).map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
