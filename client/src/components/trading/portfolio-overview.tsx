import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiTether, SiSolana, SiCardano } from "react-icons/si";

interface PortfolioAsset {
  symbol: string;
  balance: string;
  lockedBalance?: string;
  value: string;
  change24h: string;
  icon: any;
  color: string;
}

const symbolIcons: { [key: string]: { icon: any; color: string } } = {
  BTC: { icon: FaBitcoin, color: "text-orange-500" },
  ETH: { icon: FaEthereum, color: "text-blue-500" },
  USDT: { icon: SiTether, color: "text-green-500" },
  SOL: { icon: SiSolana, color: "text-purple-500" },
  ADA: { icon: SiCardano, color: "text-blue-400" }
};

export default function PortfolioOverview() {
  const { isAuthenticated } = useAuth();
  
  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ["/api/portfolio"],
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const { data: marketData } = useQuery({
    queryKey: ["/api/markets"],
    refetchInterval: 30000,
  });

  if (!isAuthenticated) {
    return (
      <Card className="glass">
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Portfolio Overview</h3>
          <p className="text-muted-foreground mb-4">Sign in to view your portfolio</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const portfolioAssets: PortfolioAsset[] = portfolio?.map((asset: any) => {
    const marketDataArray = Array.isArray(marketData) ? marketData : [];
    const marketPrice = marketDataArray.find((m: any) => m.symbol === `${asset.symbol}/USDT`)?.price || "0";
    const value = (parseFloat(asset.balance) * parseFloat(marketPrice)).toFixed(2);
    const change24h = marketDataArray.find((m: any) => m.symbol === `${asset.symbol}/USDT`)?.change24h || "0";
    const symbolInfo = symbolIcons[asset.symbol] || { icon: Wallet, color: "text-muted-foreground" };
    
    return {
      symbol: asset.symbol,
      balance: parseFloat(asset.balance).toFixed(6),
      lockedBalance: asset.lockedBalance ? parseFloat(asset.lockedBalance).toFixed(6) : undefined,
      value: `$${value}`,
      change24h: `${parseFloat(change24h) >= 0 ? '+' : ''}${parseFloat(change24h).toFixed(2)}%`,
      icon: symbolInfo.icon,
      color: symbolInfo.color
    };
  }) || [];

  const totalValue = portfolioAssets.reduce((sum, asset) => {
    return sum + parseFloat(asset.value.replace('$', ''));
  }, 0).toFixed(2);
  const totalPnL = "+$434.56 (+1.71%)";

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Wallet className="mr-2 h-5 w-5 text-[hsl(var(--accent-purple))]" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Balance</span>
            <span className="font-mono text-xl font-bold">{totalValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">24h PnL</span>
            <span className="font-mono text-green-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {totalPnL}
            </span>
          </div>
          
          <div className="space-y-3 mt-6">
            {portfolioAssets.map((asset) => {
              const IconComponent = asset.icon;
              const isPositive = asset.change24h.startsWith("+");
              const isNeutral = asset.change24h === "0.00%";
              
              return (
                <div key={asset.symbol} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${asset.color}`}>
                      <IconComponent className="text-lg" />
                    </div>
                    <div>
                      <div className="font-semibold">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {asset.balance} {asset.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{asset.value}</div>
                    <div className={`text-xs flex items-center justify-end ${
                      isNeutral 
                        ? "text-muted-foreground" 
                        : isPositive 
                          ? "text-green-400" 
                          : "text-red-400"
                    }`}>
                      {!isNeutral && (
                        <>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                        </>
                      )}
                      {asset.change24h}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
