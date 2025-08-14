import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import OrderBook from "@/components/trading/order-book";
import TradingChart from "@/components/trading/trading-chart";
import TradingPanel from "@/components/trading/trading-panel";
import PortfolioOverview from "@/components/trading/portfolio-overview";
import RecentTrades from "@/components/trading/recent-trades";
import PortfolioQuickActions from "@/components/trading/portfolio-quick-actions";
import SimpleAIChat from "@/components/trading/simple-ai-chat";
import CryptoEmotionTracker from "@/components/trading/crypto-emotion-tracker";
import NFTMarketplace from "@/components/trading/nft-marketplace";
import PersonalizedLearning from "@/components/trading/personalized-learning";
import AIPortfolioBalancer from "@/components/trading/ai-portfolio-balancer";
import SocialTradingCommunity from "@/components/trading/social-trading-community";
import VoiceTradingCommands from "@/components/trading/voice-trading-commands";
import PersonalizedDashboardBuilder from "@/components/trading/personalized-dashboard-builder";
import CryptoMemeGenerator from "@/components/trading/crypto-meme-generator";
import AccessibilityMode from "@/components/trading/accessibility-mode";
import MarketMoodTranslator from "@/components/trading/market-mood-translator";
import CryptoEducationQuiz from "@/components/trading/crypto-education-quiz";
import SocialSharingWidget from "@/components/trading/social-sharing-widget";
import PersonalizedLearningPath from "@/components/trading/personalized-learning-path";
import AnimatedDataVisualizations from "@/components/trading/animated-data-visualizations";
import P2PTrading from "@/components/trading/p2p-trading";
import MarketDataStatus from "@/components/trading/market-data-status";
import BlockchainWalletTracker from "@/components/trading/blockchain-wallet-tracker";
import { LivePriceWithChange } from "@/components/trading/live-market-ticker";
import APIServicesDashboard from "@/components/trading/api-services-dashboard";
import LiveTradingPanel from "@/components/trading/live-trading-panel";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ProtectedTradingWrapper from "@/components/auth/protected-trading-wrapper";
import EnhancedTradingInterface from "@/components/trading/enhanced-trading-interface";
import PortfolioBalanceDisplay from "@/components/trading/portfolio-balance-display";

export default function Trading() {
  const [showRiskBanner, setShowRiskBanner] = useState(true);
  const [selectedTradingType, setSelectedTradingType] = useState("spot");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Risk Disclosure Banner */}
        {showRiskBanner && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 relative">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm">
                  <strong>Risk Warning:</strong> Cryptocurrency trading involves substantial risk of loss. Only invest what you can afford to lose completely.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Link href="/risk-disclosure">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-6 px-2">
                      Read Full Risk Disclosure
                    </Button>
                  </Link>
                  <Link href="/terms-of-service">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 h-6 px-2">
                      Terms of Service
                    </Button>
                  </Link>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowRiskBanner(false)}
                className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mb-8 page-header">
          <h1 className="text-4xl font-bold mb-4 text-white">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              NebulaX Trading Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">Advanced tools for both beginners and professional traders</p>
        </div>

        {/* Comprehensive Trading Platform */}
        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 glass text-xs">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">AI Portfolio</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="nft">NFT Market</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="p2p">P2P</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <ProtectedTradingWrapper feature="trading">
              {/* Trading Type Selector */}
              <Card className="glass relative">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 relative z-10">
                    <Label className="font-semibold">Trading Type:</Label>
                    <div className="relative" ref={dropdownRef}>
                      {/* Custom Trading Type Dropdown */}
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            selectedTradingType === 'spot' ? 'bg-green-500' :
                            selectedTradingType === 'futures' ? 'bg-blue-500' :
                            selectedTradingType === 'options' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}></span>
                          <span>
                            {selectedTradingType === 'spot' ? 'Spot Trading' :
                             selectedTradingType === 'futures' ? 'Futures Trading' :
                             selectedTradingType === 'options' ? 'Options Trading' :
                             'P2P Trading'}
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      
                      {/* Custom Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[180px] z-50 bg-slate-900 border border-slate-700 rounded-md shadow-xl overflow-hidden">
                          <div
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-800 flex items-center space-x-2"
                            onClick={() => {
                              setSelectedTradingType('spot');
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Spot Trading</span>
                          </div>
                          <div
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-800 flex items-center space-x-2"
                            onClick={() => {
                              setSelectedTradingType('futures');
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Futures Trading</span>
                          </div>
                          <div
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-800 flex items-center space-x-2"
                            onClick={() => {
                              setSelectedTradingType('options');
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Options Trading</span>
                          </div>
                          <div
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-800 flex items-center space-x-2"
                            onClick={() => {
                              setSelectedTradingType('p2p');
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span>P2P Trading</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Live Market
                    </Badge>
                  </div>
                </CardContent>
              </Card>

            {/* Conditional Trading Interface Based on Selected Type */}
            {selectedTradingType === "spot" && (
              <>
                {/* Live Market Data Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <MarketDataStatus />
                  <BlockchainWalletTracker />
                </div>

                {/* Live Price Ticker */}
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-center p-3 bg-slate-800/50 rounded-lg border border-slate-600 min-h-[60px]">
                      <LivePriceWithChange symbol="BTC/USDT" className="text-center w-full" />
                    </div>
                    <div className="flex items-center justify-center p-3 bg-slate-800/50 rounded-lg border border-slate-600 min-h-[60px]">
                      <LivePriceWithChange symbol="ETH/USDT" className="text-center w-full" />
                    </div>
                    <div className="flex items-center justify-center p-3 bg-slate-800/50 rounded-lg border border-slate-600 min-h-[60px]">
                      <LivePriceWithChange symbol="SOL/USDT" className="text-center w-full" />
                    </div>
                    <div className="flex items-center justify-center p-3 bg-slate-800/50 rounded-lg border border-slate-600 min-h-[60px]">
                      <LivePriceWithChange symbol="ADA/USDT" className="text-center w-full" />
                    </div>
                  </div>
                </div>

                {/* Main Spot Trading Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <OrderBook symbol="BTC/USDT" />
                  </div>
                  <div className="lg:col-span-2">
                    <TradingChart symbol="BTC/USDT" />
                  </div>
                  <div className="lg:col-span-1">
                    <TradingPanel symbol="BTC/USDT" />
                  </div>
                </div>

                {/* Live Trading Panel */}
                <div className="mb-6">
                  <LiveTradingPanel />
                </div>

                {/* Spot Trading Analytics & Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <RecentTrades symbol="BTC/USDT" />
                  <PortfolioOverview />
                  <PortfolioQuickActions />
                  <div className="min-h-[600px]">
                    <SimpleAIChat />
                  </div>
                </div>

                {/* Crypto Emotion Tracker */}
                <CryptoEmotionTracker />
              </>
            )}

            {selectedTradingType === "futures" && (
              <div className="space-y-6">
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Futures Trading</h3>
                    <p className="text-gray-300 mb-6">Professional futures trading with up to 125x leverage</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">Perpetual Contracts</h4>
                        <p className="text-gray-400 text-sm">Trade without expiry dates with funding rates</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-400 mb-2">Quarterly Futures</h4>
                        <p className="text-gray-400 text-sm">Fixed expiry futures contracts</p>
                      </div>
                    </div>
                    <Button className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600">
                      Launch Futures Platform
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTradingType === "options" && (
              <div className="space-y-6">
                <Card className="glass">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Options Trading</h3>
                    <p className="text-gray-300 mb-6">Advanced options strategies with customizable strikes and expiries</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-400 mb-2">Call & Put Options</h4>
                        <p className="text-gray-400 text-sm">Buy and sell European & American style options</p>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-2">Options Strategies</h4>
                        <p className="text-gray-400 text-sm">Spreads, straddles, and complex strategies</p>
                      </div>
                    </div>
                    <Button className="mt-6 bg-gradient-to-r from-purple-600 to-green-600">
                      Launch Options Platform
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTradingType === "p2p" && (
              <div className="space-y-6">
                <P2PTrading />
              </div>
            )}
            </ProtectedTradingWrapper>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <ProtectedTradingWrapper feature="trading">
              <EnhancedTradingInterface />
            </ProtectedTradingWrapper>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <ProtectedTradingWrapper feature="trading">
              <PortfolioBalanceDisplay />
            </ProtectedTradingWrapper>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialTradingCommunity />
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <PersonalizedLearningPath />
              </div>
              <div>
                <CryptoEducationQuiz />
              </div>
            </div>
            <PersonalizedLearning />
          </TabsContent>

          <TabsContent value="nft" className="space-y-6">
            <NFTMarketplace />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceTradingCommands />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <PersonalizedDashboardBuilder />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <APIServicesDashboard />
          </TabsContent>

          <TabsContent value="live-trading" className="space-y-6">
            <LiveTradingPanel />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CryptoMemeGenerator />
              </div>
              <div>
                <AccessibilityMode />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <MarketMoodTranslator />
              </div>
              <div>
                <AnimatedDataVisualizations />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <SocialSharingWidget />
          </TabsContent>

          <TabsContent value="p2p" className="space-y-6">
            <ProtectedTradingWrapper feature="p2p">
              <P2PTrading />
            </ProtectedTradingWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
