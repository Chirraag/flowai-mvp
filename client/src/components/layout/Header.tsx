import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/constants";
import { BarChart3, Settings, Users, Menu } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationPanel } from "@/components/NotificationPanel";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  // Use default values if context not yet available
  const { language = "en", setLanguage = () => {} } = {};
  const [location] = useLocation();

  const isMobile = useIsMobile();

  // Get page title from location
  const getPageTitle = () => {
    const path = location === "/" ? "/dashboard" : location;
    
    // Handle specific page titles
    if (path === "/ai-settings") {
      return "AI Agent Settings";
    }
    
    const title = path.split("/")[1];
    return title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ");
  };

  const handleLanguageChange = (value: string) => {
    // Will be connected to context once fixed
    console.log("Language changed to:", value);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center">
          {isMobile && (
            <button
              type="button"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-3"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{getPageTitle()}</h1>
        </div>
        
        {/* Navigation Tabs - Hidden on small screens */}
        <div className="hidden lg:flex items-center space-x-6">
          
          {/* Language and Notifications */}
          <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-6">
            <div className="relative">
              <Select defaultValue={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[120px] h-10 px-3 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <NotificationPanel />
          </div>
        </div>

        {/* Mobile notifications only */}
        <div className="flex lg:hidden items-center">
          <NotificationPanel />
        </div>
      </div>
    </header>
  );
}
