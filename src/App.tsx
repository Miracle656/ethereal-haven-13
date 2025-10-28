import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PushUniversalWalletProvider, PushUI } from "@pushchain/ui-kit";
import Index from "./pages/Index";
import Collection from "./pages/Collection";
import Profile from "./pages/Profile";
import MintNft from "./pages/MintNft";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const walletConfig = {
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PushUniversalWalletProvider config={walletConfig}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="dark min-h-screen bg-background text-foreground">
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/collection/:id" element={<Collection />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mint" element={<MintNft />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </PushUniversalWalletProvider>
  </QueryClientProvider>
);

export default App;
