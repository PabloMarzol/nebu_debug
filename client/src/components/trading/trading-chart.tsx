import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Camera, Share2, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface TradingChartProps {
  symbol: string;
}

export default function TradingChart({ symbol }: TradingChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("5m");

  // Fetch live market data
  const { data: markets } = useQuery({
    queryKey: ['/api/markets'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Find current symbol data - handle format conversion
  const normalizedSymbol = symbol.replace('/', '');
  const symbolData = Array.isArray(markets) ? markets.find((market: any) => 
    market.symbol === symbol || market.symbol === normalizedSymbol || market.symbol.replace('/', '') === normalizedSymbol
  ) : null;
  const currentPrice = symbolData ? parseFloat(symbolData.price) : 0;
  const priceChange = symbolData ? parseFloat(symbolData.change24h) : 0;
  const priceChangePercent = priceChange;

  const timeframes = ["1m", "5m", "1h", "1d"];

  // Use only live price data - no simulation
  const chartData = currentPrice > 0 ? Array(50).fill(currentPrice) : [1000]; // Default to 1000 to avoid division by zero
  const maxPrice = chartData.length > 0 ? Math.max(...chartData) : 1000;
  const minPrice = chartData.length > 0 ? Math.min(...chartData) : 1000;
  
  // Ensure we don't have division by zero
  const priceRange = maxPrice - minPrice;
  const safeRange = priceRange > 0 ? priceRange : 1;

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="mr-2 h-5 w-5 text-purple-400" />
            {symbol} Chart
          </CardTitle>
          <div className="flex space-x-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe}
                size="sm"
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-xs ${
                  selectedTimeframe === timeframe 
                    ? "bg-purple-500" 
                    : "hover:bg-purple-500/20"
                }`}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Header */}
        <div className="flex items-center justify-between mb-4 p-4 bg-muted/20 rounded-lg">
          <div>
            <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="font-semibold">
              {symbolData ? `${parseFloat(symbolData.volume24h).toLocaleString()} USDT` : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Simple SVG Chart */}
        <div className="rounded-xl h-96 bg-slate-900/50 p-4">
          <svg width="100%" height="100%" viewBox="0 0 800 300" className="w-full h-full">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 50}
                x2="800"
                y2={i * 50}
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Price line */}
            <path
              d={`M 0,${150 - ((chartData[0] - minPrice) / safeRange) * 100} ${chartData
                .map((price, i) => `L ${(i / (chartData.length - 1)) * 800},${150 - ((price - minPrice) / safeRange) * 100}`)
                .join(' ')}`}
              fill="url(#priceGradient)"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
            
            {/* Price points */}
            {chartData.map((price, i) => (
              <circle
                key={i}
                cx={(i / (chartData.length - 1)) * 800}
                cy={150 - ((price - minPrice) / safeRange) * 100}
                r="2"
                fill="#8b5cf6"
                opacity="0.8"
              />
            ))}
            
            {/* Current price indicator */}
            <line
              x1="0"
              y1={150 - ((currentPrice - minPrice) / safeRange) * 100}
              x2="800"
              y2={150 - ((currentPrice - minPrice) / safeRange) * 100}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            <text
              x="10"
              y={150 - ((currentPrice - minPrice) / safeRange) * 100 - 5}
              fill="#10b981"
              fontSize="12"
              fontWeight="bold"
            >
              ${currentPrice.toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Chart Controls */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="flex space-x-4 text-sm">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
              Current Price
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-purple-400 rounded mr-2"></div>
              Price Movement
            </span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Camera className="w-3 h-3 mr-1" />
              Screenshot
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Add Indicators
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
