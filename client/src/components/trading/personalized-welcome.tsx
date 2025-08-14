import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { 
  Star, 
  TrendingUp, 
  Award, 
  Target,
  Sparkles,
  Clock
} from "lucide-react";

export default function PersonalizedWelcome() {
  const { user, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(0);

  const learningTips = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Set Your Trading Goals",
      content: "Define clear profit targets and risk limits before placing any trade. Success follows strategy!",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Master Technical Analysis",
      content: "Learn to read candlestick patterns and support/resistance levels. Charts tell the market's story!",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Practice Risk Management",
      content: "Never risk more than 2% of your portfolio on a single trade. Preservation beats perfection!",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Stay Updated on News",
      content: "Market sentiment drives prices. Follow crypto news and major announcements for better timing!",
      color: "from-orange-400 to-red-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % learningTips.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getUserName = () => {
    if (!isAuthenticated || !user) return "Trader";
    return (user as any)?.firstName || (user as any)?.email?.split('@')[0] || "Trader";
  };

  return (
    <Card className="glass-enhanced border-2 border-purple-400/30 mb-6 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Star className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {getGreeting()}, {getUserName()}! 🚀
              </h2>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {currentTime.toLocaleTimeString()} • Ready to trade?
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Trading Level</div>
              <div className="text-lg font-bold text-green-400">Pro Trader</div>
            </div>
          )}
        </div>

        {/* Learning Tip with Smooth Transition */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r p-4 transition-all duration-1000 ease-in-out" 
             style={{
               background: `linear-gradient(135deg, ${learningTips[tipIndex].color.split(' ')[1]} 0%, ${learningTips[tipIndex].color.split(' ')[3]} 100%)`
             }}>
          <div className="flex items-start space-x-3 text-white">
            <div className="mt-1 opacity-80">
              {learningTips[tipIndex].icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 transition-all duration-500">
                💡 {learningTips[tipIndex].title}
              </h3>
              <p className="text-xs opacity-90 transition-all duration-500">
                {learningTips[tipIndex].content}
              </p>
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="flex space-x-1 mt-3">
            {learningTips.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded transition-all duration-300 ${
                  index === tipIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-400 mb-2">🎯 Start your crypto journey today!</p>
            <Button 
              size="sm" 
              className="btn-micro-hover bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={() => window.location.href = '/auth/register'}
            >
              Sign Up for Free Demo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}