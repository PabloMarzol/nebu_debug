import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { List } from "lucide-react";

interface OrderBookProps {
  symbol: string;
}

interface Order {
  price: string;
  amount: string;
  total: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const { data: orderBook } = useQuery({
    queryKey: [`/api/orderbook/${symbol}`],
    refetchInterval: 1000,
  });

  // Get live market data for consistent pricing
  const { data: markets } = useQuery({
    queryKey: ['/api/markets'],
    refetchInterval: 5000,
  });

  // Handle symbol format conversion for consistent price display
  const normalizedSymbol = symbol.replace('/', '');
  const symbolData = Array.isArray(markets) ? markets.find((market: any) => 
    market.symbol === symbol || market.symbol === normalizedSymbol || market.symbol.replace('/', '') === normalizedSymbol
  ) : null;

  // Use real order book data from API, with fallback handling
  const buyOrders = Array.isArray(orderBook?.bids) ? orderBook.bids : [];
  const sellOrders = Array.isArray(orderBook?.asks) ? orderBook.asks : [];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <List className="mr-2 h-5 w-5 text-[hsl(var(--accent-purple))]" />
          Order Book
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-b border-border pb-2">
            <span>Price (USDT)</span>
            <span>Amount (BTC)</span>
            <span>Total</span>
          </div>
          
          {/* Sell Orders */}
          {sellOrders.length > 0 ? sellOrders.slice(0, 3).map((order: any, index: number) => (
            <div key={`sell-${index}`} className="grid grid-cols-3 gap-2 text-xs font-mono">
              <span className="text-red-400">{parseFloat(order.price).toFixed(2)}</span>
              <span className="text-muted-foreground">{order.amount}</span>
              <span className="text-muted-foreground">{(parseFloat(order.price) * parseFloat(order.amount)).toFixed(2)}</span>
            </div>
          )) : (
            <div className="text-center text-muted-foreground text-sm">Loading orders...</div>
          )}
          
          {/* Current Price - Use live market data */}
          <div className="text-center py-2 border-y border-border">
            <span className="font-mono text-lg font-bold text-[hsl(var(--accent-cyan))]">
              {symbolData ? `$${parseFloat(symbolData.price).toLocaleString(undefined, { 
                minimumFractionDigits: parseFloat(symbolData.price) > 1 ? 2 : 6,
                maximumFractionDigits: parseFloat(symbolData.price) > 1 ? 2 : 6
              })}` : 'Loading...'}
            </span>
          </div>
          
          {/* Buy Orders */}
          {buyOrders.length > 0 ? buyOrders.slice(0, 3).map((order: any, index: number) => (
            <div key={`buy-${index}`} className="grid grid-cols-3 gap-2 text-xs font-mono">
              <span className="text-green-400">{parseFloat(order.price).toFixed(2)}</span>
              <span className="text-muted-foreground">{order.amount}</span>
              <span className="text-muted-foreground">{(parseFloat(order.price) * parseFloat(order.amount)).toFixed(2)}</span>
            </div>
          )) : (
            <div className="text-center text-muted-foreground text-sm">Loading orders...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
