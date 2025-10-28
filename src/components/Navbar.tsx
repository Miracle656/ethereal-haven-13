import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PushUniversalAccountButton } from "@pushchain/ui-kit";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">NFT Market</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Profile
            </Link>
            <Link to="/mint" className="text-sm font-medium hover:text-primary transition-colors">
              Mint
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search collections and NFTs" 
              className="pl-9 bg-secondary border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PushUniversalAccountButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
