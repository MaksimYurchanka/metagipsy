import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  BarChart3, 
  Sparkles, 
  Settings, 
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className = '' }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ SAFARI-COMPATIBLE: Простые стили без сложных градиентов
  const getCurrentPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return {
        icon: Home,
        title: 'Home',
        bgClass: 'bg-gray-50 dark:bg-gray-900/20',
        borderClass: 'border-gray-200 dark:border-gray-800'
      };
    } else if (path === '/analyze') {
      return {
        icon: Sparkles,
        title: 'Analysis Page',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'border-blue-200 dark:border-blue-800'
      };
    } else if (path === '/dashboard') {
      return {
        icon: BarChart3,
        title: 'Personal Dashboard',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        borderClass: 'border-purple-200 dark:border-purple-800'
      };
    } else if (path === '/settings') {
      return {
        icon: Settings,
        title: 'Settings',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        borderClass: 'border-green-200 dark:border-green-800'
      };
    }
    
    return {
      icon: Home,
      title: 'MetaGipsy',
      bgClass: 'bg-gray-50 dark:bg-gray-900/20',
      borderClass: 'border-gray-200 dark:border-gray-800'
    };
  };

  const pageInfo = getCurrentPageInfo();
  const PageIcon = pageInfo.icon;

  // ✅ SAFARI-COMPATIBLE: Custom dropdown без Radix
  const UserDropdown = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:block max-w-32 truncate">
          {user?.email}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isUserMenuOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Free Tier • Authenticated
            </p>
          </div>
          
          <div className="py-1">
            <Link
              to="/dashboard"
              className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/analyze"
              className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            
            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
              <button
                onClick={() => {
                  signOut();
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ✅ SAFARI-COMPATIBLE: Simplified navbar */}
      <div className={`flex items-center justify-between mb-6 p-4 ${pageInfo.bgClass} rounded-lg border ${pageInfo.borderClass} ${className}`}>
        {/* Left side - Logo + Current Page */}
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            MetaGipsy OWL
          </Link>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <PageIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {pageInfo.title}
            </span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {/* Navigation Buttons */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {location.pathname !== '/' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </Button>
              )}
              
              {location.pathname !== '/analyze' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/analyze" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analyze
                  </Link>
                </Button>
              )}
              
              {location.pathname !== '/dashboard' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
            </div>
          )}
          
          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 dark:text-green-400 font-medium hidden lg:block">
                  Signed in
                </span>
              </div>
              
              <UserDropdown />
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/analyze">
                <Sparkles className="h-4 w-4 mr-2" />
                Sign In to Start
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ✅ SAFARI-COMPATIBLE: Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/analyze"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 pb-2">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/analyze"
                className="flex items-center gap-2 p-2 bg-blue-600 text-white rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4" />
                Sign In to Start
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ✅ SAFARI-COMPATIBLE: Click outside to close dropdown */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default NavBar;