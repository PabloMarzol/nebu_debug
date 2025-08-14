import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface LiveMarketTickerProps {
  symbol?: string;
  showChange?: boolean;
  showVolume?: boolean;
  className?: string;
}

export default function LiveMarketTicker({ 
  symbol = "BTC/USDT", 
  showChange = true, 
  showVolume = false,
  className = ""
}: LiveMarketTickerProps) {
  const { data: markets, isLoading } = useQuery({
    queryKey: ['/api/markets'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  const symbolData = Array.isArray(markets) ? markets.find((market: any) => market.symbol === symbol) : null;

  if (isLoading || !symbolData) {
    return (
      <div className={`flex flex-col items-center justify-center text-center space-y-1 ${className}`}>
        <div className="text-xs text-slate-400 font-medium">
          {symbol}
        </div>
        <Activity className="w-4 h-4 animate-pulse text-blue-400" />
        <span className="text-xs text-slate-400">Loading...</span>
      </div>
    );
  }

  const price = parseFloat(symbolData.price);
  const change24h = parseFloat(symbolData.change24h);
  const volume24h = parseFloat(symbolData.volume24h);
  const isPositive = change24h >= 0;

  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-1 ${className}`}>
      <div className="text-xs text-slate-400 font-medium">
        {symbol}
      </div>
      <div className="font-semibold text-white text-lg">
        ${price.toLocaleString(undefined, { 
          minimumFractionDigits: price > 1 ? 2 : 6,
          maximumFractionDigits: price > 1 ? 2 : 6
        })}
      </div>
      {showChange && (
        <div className={`flex items-center justify-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
        </div>
      )}
      {showVolume && (
        <div className="text-xs text-slate-400 text-center">
          Vol: {volume24h.toLocaleString()}
        </div>
      )}
    </div>
  );
}

// Simplified component for displaying just price
export function LivePrice({ symbol, className = "" }: { symbol: string; className?: string }) {
  return <LiveMarketTicker symbol={symbol} showChange={false} showVolume={false} className={className} />;
}

// Component for displaying price with change
export function LivePriceWithChange({ symbol, className = "" }: { symbol: string; className?: string }) {
  return <LiveMarketTicker symbol={symbol} showChange={true} showVolume={false} className={className} />;
}

// Full market data component
export function LiveMarketData({ symbol, className = "" }: { symbol: string; className?: string }) {
  return <LiveMarketTicker symbol={symbol} showChange={true} showVolume={true} className={className} />;
}