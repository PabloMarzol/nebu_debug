import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TradingPanelProps {
  symbol: string;
}

export default function TradingPanel({ symbol }: TradingPanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("market");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get current market price
  const { data: marketData } = useQuery({
    queryKey: ["/api/markets", symbol],
    refetchInterval: 5000,
  });

  // Get user portfolio for balance checking
  const { data: portfolio } = useQuery({
    queryKey: ["/api/portfolio"],
    enabled: isAuthenticated,
  });

  // Set price from market data
  const currentPrice = marketData?.price || "0";
  if (!price && currentPrice !== "0") {
    setPrice(currentPrice);
  }

  const placOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: `${side.toUpperCase()} order placed successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    placOrderMutation.mutate({
      symbol: symbol.replace("/", ""),
      side,
      type: orderType,
      amount,
      price: orderType === "limit" ? price : undefined,
    });
  };

  const percentageButtons = ["25%", "50%", "75%", "100%"];

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex space-x-2 mb-4">
          <Button
            className={`flex-1 py-2 font-medium ${
              side === "buy" 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-muted text-muted-foreground hover:bg-green-600 hover:text-white"
            }`}
            onClick={() => setSide("buy")}
          >
            Buy
          </Button>
          <Button
            className={`flex-1 py-2 font-medium ${
              side === "sell" 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-muted text-muted-foreground hover:bg-red-600 hover:text-white"
            }`}
            onClick={() => setSide("sell")}
          >
            Sell
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm text-muted-foreground mb-2">Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {orderType === "limit" && (
            <div>
              <Label className="block text-sm text-muted-foreground mb-2">Price (USDT)</Label>
              <Input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
                placeholder="67,834.50"
              />
            </div>
          )}
          
          <div>
            <Label className="block text-sm text-muted-foreground mb-2">Amount (BTC)</Label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              placeholder="0.0000"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            {percentageButtons.map((percentage) => (
              <Button
                key={percentage}
                type="button"
                size="sm"
                variant="outline"
                className="flex-1 text-xs hover:bg-muted"
                onClick={() => {
                  // Mock percentage calculation
                  const mockBalance = 1250.00;
                  const currentPrice = parseFloat(price.replace(/,/g, ""));
                  const percentValue = parseInt(percentage) / 100;
                  const calculatedAmount = (mockBalance * percentValue) / currentPrice;
                  setAmount(calculatedAmount.toFixed(6));
                }}
              >
                {percentage}
              </Button>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-mono">1,250.00 USDT</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-mono">
                {amount && price ? (parseFloat(amount) * parseFloat(price.replace(/,/g, ""))).toFixed(2) : "0.00"} USDT
              </span>
            </div>
          </div>
          
          <Button
            type="submit"
            className={`w-full py-3 font-semibold transition-all duration-300 ${
              side === "buy"
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
            }`}
            disabled={placOrderMutation.isPending}
          >
            {placOrderMutation.isPending ? "Placing Order..." : `${side === "buy" ? "Buy" : "Sell"} BTC`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
