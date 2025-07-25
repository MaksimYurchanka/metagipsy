import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  BarChart3, 
  Settings, 
  Home, 
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,  // ✅ ADDED: LinkedIn icon
  User,
  LogOut,
  Crown,
  UserPlus  // ✅ ADDED: UserPlus for Register
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/stores/settingsStore';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { user, loading, signOut, isAuthenticated } = useAuth();

  // ✅ UPDATED: Navigation array with Pricing integration
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Analyze', href: '/analyze', icon: Zap },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Pricing', href: '/pricing', icon: Crown },  // ✅ ADDED: Pricing navigation
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Show loading during auth check
  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* ✅ ENHANCED: Mobile sidebar backdrop with blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ FIXED: Enhanced Desktop & Mobile SideBar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={cn(
          // ✅ ENHANCED: Solid dark background for mobile
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border",
          "bg-gray-900/95 backdrop-blur-md lg:bg-card",
          "lg:static lg:translate-x-0 lg:!block lg:!relative lg:!transform-none",
          "flex flex-col shadow-2xl lg:shadow-none",
          // ✅ FORCE: Desktop always visible
          "lg:flex lg:w-64 lg:min-w-[16rem]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MetaGipsy
            </span>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info (if authenticated) */}
        {isAuthenticated && (
          <div className="px-6 py-3 border-b border-border bg-accent/20">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-accent/60 hover:shadow-sm"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  active 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )} />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
                {/* ✅ ADDED: Special indicator for pricing */}
                {item.name === 'Pricing' && !active && (
                  <div className="ml-auto">
                    <Crown className="w-3 h-3 text-yellow-500 opacity-60" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth section - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {/* ✅ UPDATED: Footer with correct social links */}
        <div className="p-4 border-t border-border bg-accent/10">
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              asChild
            >
              <a
                href="https://github.com/MaksimYurchanka"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            
            {/* ✅ NEW: LinkedIn button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              asChild
            >
              <a
                href="https://www.linkedin.com/in/maksim-yurchanka-91208696/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              asChild
            >
              <a
                href="https://x.com/MaksimYurchanka"
                target="_blank"
                rel="noopener noreferrer"
                title="X / Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2 font-medium">
            v1.0.0 • OWL Chess Engine
          </p>
        </div>
      </motion.div>

      {/* ✅ FIXED: Main content с учетом SideBar width */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {navigation.find(item => isActive(item.href))?.name || 'MetaGipsy'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI Conversation Analysis with Chess-like Scoring
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {user?.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-800">
                  <User className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <>
                {/* ✅ UPDATED: Upgrade to Pro button now links to pricing */}
                <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                  <Link to="/pricing" className="flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                    Upgrade to Pro
                  </Link>
                </Button>
                
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In / Register
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Layout;