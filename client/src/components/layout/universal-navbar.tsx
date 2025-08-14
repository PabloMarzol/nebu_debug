import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Atom, 
  Menu, 
  TrendingUp, 
  Users, 
  Brain, 
  Rocket,
  BarChart3,
  Shield,
  Briefcase,
  Star,
  ChevronDown,
  Phone,
  PlayCircle,
  User,
  LogOut,
  Settings
} from "lucide-react";

export default function UniversalNavbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Atom className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Nebula X
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/trading">
              <Button
                variant="ghost"
                className={`hover:text-purple-400 transition-colors ${
                  isActive("/trading") ? "text-purple-400" : ""
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trading
              </Button>
            </Link>

            <Link href="/markets">
              <Button
                variant="ghost"
                className={`hover:text-purple-400 transition-colors ${
                  isActive("/markets") ? "text-purple-400" : ""
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Markets
              </Button>
            </Link>

            <Link href="/portfolio">
              <Button
                variant="ghost"
                className={`hover:text-purple-400 transition-colors ${
                  isActive("/portfolio") ? "text-purple-400" : ""
                }`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Portfolio
              </Button>
            </Link>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:text-purple-400 transition-colors">
                  Services
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/staking" className="w-full">
                    <Star className="w-4 h-4 mr-2" />
                    Staking
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/p2p-trading" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    P2P Trading
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/copy-trading" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Copy Trading
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/otc-desk" className="w-full">
                    <Briefcase className="w-4 h-4 mr-2" />
                    OTC Desk
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/launchpad" className="w-full">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launchpad
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-assistant" className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:text-purple-400 transition-colors">
                  More
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/demo" className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Demo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="w-full">
                    About
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Section - Dynamic */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : isAuthenticated && user ? (
              /* Authenticated User Display */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{user.firstName || user.email?.split('@')[0] || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.firstName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Link href="/client-portal">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <Link href="/security-settings">Security Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                        .then(() => window.location.reload());
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Unauthenticated - Show Sign In/Up */
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Link href="/trading" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Trading
                    </Button>
                  </Link>
                  <Link href="/markets" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Markets
                    </Button>
                  </Link>
                  <Link href="/portfolio" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/staking" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Staking
                    </Button>
                  </Link>
                  <Link href="/p2p-trading" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      P2P Trading
                    </Button>
                  </Link>
                  <Link href="/copy-trading" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Copy Trading
                    </Button>
                  </Link>
                  <Link href="/otc-desk" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      OTC Desk
                    </Button>
                  </Link>
                  <Link href="/launchpad" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Rocket className="mr-2 h-4 w-4" />
                      Launchpad
                    </Button>
                  </Link>
                  <Link href="/ai-assistant" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Brain className="mr-2 h-4 w-4" />
                      AI Assistant
                    </Button>
                  </Link>
                  <Link href="/demo" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Demo
                    </Button>
                  </Link>
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </Link>
                  <Link href="/about" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      About
                    </Button>
                  </Link>
                  <div className="border-t pt-4 space-y-2">
                    {isAuthenticated && user ? (
                      /* Authenticated User in Mobile */
                      <>
                        <div className="px-2 py-1.5 text-sm">
                          <p className="font-medium">{user.firstName || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Link href="/client-portal" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            My Account
                          </Button>
                        </Link>
                        <Link href="/security-settings" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Security Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                              .then(() => window.location.reload());
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      /* Unauthenticated in Mobile */
                      <>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}