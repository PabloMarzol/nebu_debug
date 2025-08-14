import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface MarketOverviewProps {
  className?: string;
  showDetailed?: boolean;
}

export default function LiveMarketOverview({ className = "", showDetailed = false }: MarketOverviewProps) {
  const { data: markets, isLoading } = useQuery({
    queryKey: ['/api/markets'],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className={`glass ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 animate-pulse text-blue-400" />
            Live Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topMarkets = Array.isArray(markets) ? markets.slice(0, showDetailed ? 8 : 4) : [];

  return (
    <Card className={`glass ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-400" />
          Live Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topMarkets.map((market: any) => {
            const price = parseFloat(market.price);
            const change = parseFloat(market.change24h);
            const volume = parseFloat(market.volume24h);
            const isPositive = change >= 0;

            return (
              <div
                key={market.symbol}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-white">
                    {market.symbol.replace('/USDT', '')}
                  </div>
                  <div className="text-lg font-bold text-white">
                    ${price.toLocaleString(undefined, {
                      minimumFractionDigits: price > 1 ? 2 : 6,
                      maximumFractionDigits: price > 1 ? 2 : 6
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </div>
                  {showDetailed && (
                    <div className="text-xs text-slate-400">
                      Vol: {volume.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for smaller spaces
export function CompactMarketOverview({ className = "" }: { className?: string }) {
  return <LiveMarketOverview className={className} showDetailed={false} />;
}

// Detailed version for main dashboards
export function DetailedMarketOverview({ className = "" }: { className?: string }) {
  return <LiveMarketOverview className={className} showDetailed={true} />;
}