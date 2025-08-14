import { useQuery } from "@tanstack/react-query";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  volume24h: string;
}

export function useMarketData() {
  return useQuery({
    queryKey: ["/api/coincap/assets"],
    queryFn: async (): Promise<MarketData[]> => {
      try {
        const response = await fetch('/api/coincap/assets');
        if (!response.ok) {
          throw new Error('API request failed');
        }
        const data = await response.json();
        
        // Convert CoinCap format to MarketData format
        return data.data?.map((asset: any) => ({
          symbol: `${asset.symbol}/USDT`,
          name: asset.name,
          price: parseFloat(asset.priceUsd).toFixed(2),
          change24h: parseFloat(asset.changePercent24Hr).toFixed(2),
          volume24h: asset.volumeUsd24Hr
        })) || [];
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        // Return empty array to trigger fallback in component
        return [];
      }
    },
    refetchInterval: 10000, // Update every 10 seconds
    retry: false, // Don't retry failed requests
  });
}
