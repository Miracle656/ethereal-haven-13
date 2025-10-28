export interface NFT {
  id: string;
  name: string;
  image: string;
  price: string;
  collectionId: string;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  creator: string;
  description: string;
  banner: string;
  avatar: string;
  floorPrice: string;
  totalVolume: string;
  items: number;
  listed: string;
  verified: boolean;
  blockchain: string;
}

export const collections: Collection[] = [
  {
    id: "cryptopunks",
    name: "CryptoPunks",
    creator: "Larva Labs",
    description: "10,000 unique collectible characters with proof of ownership stored on the Ethereum blockchain.",
    banner: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&h=200&fit=crop",
    floorPrice: "41.00",
    totalVolume: "1.3M",
    items: 9994,
    listed: "0.9%",
    verified: true,
    blockchain: "Ethereum"
  },
  {
    id: "ringers",
    name: "Ringers by Dmitri Cherniak",
    creator: "Art_Blocks",
    description: "There are an almost infinite number of ways to wrap a string around a set of pegs.",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=200&h=200&fit=crop",
    floorPrice: "8.75",
    totalVolume: "32.9K",
    items: 1000,
    listed: "0.9%",
    verified: true,
    blockchain: "Ethereum"
  },
  {
    id: "dxterminal",
    name: "DX Terminal",
    creator: "DXLabs",
    description: "Exclusive access terminals for the decentralized future.",
    banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&h=200&fit=crop",
    floorPrice: "0.01",
    totalVolume: "1,194.50",
    items: 5000,
    listed: "2.3%",
    verified: true,
    blockchain: "Ethereum"
  },
  {
    id: "hypurr",
    name: "Hypurr",
    creator: "PurrLabs",
    description: "Hyper cute cats living on the blockchain.",
    banner: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200&h=200&fit=crop",
    floorPrice: "1.50",
    totalVolume: "15.2K",
    items: 8888,
    listed: "3.6%",
    verified: true,
    blockchain: "Ethereum"
  },
  {
    id: "bayc",
    name: "Bored Ape Yacht Club",
    creator: "Yuga Labs",
    description: "A collection of 10,000 Bored Ape NFTs—unique digital collectibles living on the Ethereum blockchain.",
    banner: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=200&h=200&fit=crop",
    floorPrice: "7.20",
    totalVolume: "823K",
    items: 10000,
    listed: "1.4%",
    verified: true,
    blockchain: "Ethereum"
  },
  {
    id: "pudgypenguins",
    name: "Pudgy Penguins",
    creator: "PudgyPenguins",
    description: "A collection of 8,888 Pudgy Penguins waddling on the Ethereum blockchain.",
    banner: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=1200&h=400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=200&h=200&fit=crop",
    floorPrice: "7.15",
    totalVolume: "456K",
    items: 8888,
    listed: "1.8%",
    verified: true,
    blockchain: "Ethereum"
  }
];

export const nfts: NFT[] = [
  // CryptoPunks
  { id: "punk1", name: "CryptoPunk #1234", image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop", price: "45.5", collectionId: "cryptopunks" },
  { id: "punk2", name: "CryptoPunk #5678", image: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400&h=400&fit=crop", price: "42.0", collectionId: "cryptopunks" },
  { id: "punk3", name: "CryptoPunk #9012", image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop", price: "41.0", collectionId: "cryptopunks" },
  { id: "punk4", name: "CryptoPunk #3456", image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop", price: "43.2", collectionId: "cryptopunks" },
  
  // Ringers
  { id: "ring1", name: "Ringer #123", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop", price: "9.2", collectionId: "ringers" },
  { id: "ring2", name: "Ringer #456", image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400&h=400&fit=crop", price: "8.75", collectionId: "ringers" },
  { id: "ring3", name: "Ringer #789", image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop", price: "10.1", collectionId: "ringers" },
  { id: "ring4", name: "Ringer #234", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop", price: "9.5", collectionId: "ringers" },
  
  // DX Terminal
  { id: "dx1", name: "DX Terminal #001", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop", price: "0.015", collectionId: "dxterminal" },
  { id: "dx2", name: "DX Terminal #002", image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=400&fit=crop", price: "0.012", collectionId: "dxterminal" },
  { id: "dx3", name: "DX Terminal #003", image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400&h=400&fit=crop", price: "0.01", collectionId: "dxterminal" },
  
  // User Profile NFTs
  { id: "user1", name: "Cool Cat #1234", image: "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=400&fit=crop", price: "2.5", collectionId: "hypurr" },
  { id: "user2", name: "Ape #5678", image: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=400&h=400&fit=crop", price: "8.0", collectionId: "bayc" },
  { id: "user3", name: "Penguin #9012", image: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=400&h=400&fit=crop", price: "7.5", collectionId: "pudgypenguins" },

  {
    id: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C", name: "DIVINITY #1", image: "https://blue-sophisticated-hornet-740.mypinata.cloud/ipfs/Qme6CTP3Jy6x5Ls1hZFfaMNXWTujLksXY7DuTLvmowGvyD/images/BUBBLE.png", price: "3.0", collectionId: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C"
  },
  {
    id: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C", name: "DIVINITY #2", image: "https://blue-sophisticated-hornet-740.mypinata.cloud/ipfs/Qme6CTP3Jy6x5Ls1hZFfaMNXWTujLksXY7DuTLvmowGvyD/images/doofus.png", price: "3.0", collectionId: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C"
  },
  {
    id: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C", name: "DIVINITY #3", image: "https://blue-sophisticated-hornet-740.mypinata.cloud/ipfs/Qme6CTP3Jy6x5Ls1hZFfaMNXWTujLksXY7DuTLvmowGvyD/images/hearty.png", price: "3.0", collectionId: "0xdD6b8Fd53447bb43cB9F90B525bA307cdf8A0A8C"
  }
];
