import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePNSMarketplace, PNSName } from "@/hooks/usePNSMarketplace";
import { useToast } from "@/hooks/use-toast";
import { Tag, Loader2, Globe } from "lucide-react";
import { usePushChainClient } from "@pushchain/ui-kit";

interface ListPNSNameDialogProps {
    name: PNSName;
    onSuccess?: () => void;
    children?: React.ReactNode;
}

const ListPNSNameDialog = ({
    name,
    onSuccess,
    children,
}: ListPNSNameDialogProps) => {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState("");
    const [isListing, setIsListing] = useState(false);

    const { listPNSName } = usePNSMarketplace();
    const { toast } = useToast();
    const { pushChainClient } = usePushChainClient();

    const handleList = async () => {
        if (!pushChainClient) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!price || parseFloat(price) <= 0) {
            toast({
                title: "Invalid Price",
                description: "Please enter a valid price",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsListing(true);
            await listPNSName(name.name, name.tokenId, price);
            setIsListing(false);
            setOpen(false);
            setPrice("");
            onSuccess?.();
        } catch (error) {
            setIsListing(false);
        }
    };

    // Calculate days until expiry
    const daysUntilExpiry = Math.floor(
        (name.expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Tag className="h-4 w-4 mr-2" />
                        List for Sale
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>List PNS Name for Sale</DialogTitle>
                    <DialogDescription>
                        Set your price for this universal name
                    </DialogDescription>
                </DialogHeader>

                {/* Name Preview */}
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{name.name}.push</h4>
                        <p className="text-sm text-muted-foreground">
                            Expires in {daysUntilExpiry} days
                        </p>
                        {name.isPremium && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                                Premium
                            </span>
                        )}
                    </div>
                </div>

                {/* Listing Form */}
                <div className="space-y-4 py-4">
                    {/* Price Input */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Fixed Price (ETH)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isListing}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the price in ETH
                        </p>
                    </div>

                    {/* Process Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm mb-2">Listing Process:</h4>
                        <ol className="text-xs space-y-1 text-muted-foreground list-decimal list-inside">
                            <li>Approve marketplace contract</li>
                            <li>List PNS name on marketplace</li>
                        </ol>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            ✓ No wrapping needed - direct PNS listing!
                        </p>
                    </div>

                    {/* Fee Info */}
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Listing Fee</span>
                            <span className="font-semibold">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Platform Fee</span>
                            <span className="font-semibold">2.5%</span>
                        </div>
                        {price && (
                            <div className="flex justify-between text-sm pt-2 border-t">
                                <span className="font-semibold">You'll Receive</span>
                                <span className="font-semibold">
                                    {(parseFloat(price) * 0.975).toFixed(4)} ETH
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isListing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleList}
                        disabled={isListing || !price || parseFloat(price) <= 0}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {isListing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Listing...
                            </>
                        ) : (
                            <>
                                <Tag className="mr-2 h-4 w-4" />
                                List Name
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ListPNSNameDialog;
