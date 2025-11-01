import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavigationBlockerProvider } from "@/context/NavigationBlockerContext";

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Auto-expand logic: expand on hover (desktop only)
  const effectiveExpanded = useMemo(() => isMobile ? false : isSidebarHovered, [isMobile, isSidebarHovered]);
  
  // Dynamic dimensions - memoized to prevent unnecessary recalculations
  const sidebarWidth = useMemo(() => effectiveExpanded ? 256 : 64, [effectiveExpanded]);
  
  // Calculate transform offset for GPU-accelerated animation
  // Base margin is 64px (w-16), so we only need to translate by the difference
  const transformOffset = useMemo(() => {
    if (isMobile) return 0;
    return sidebarWidth - 64; // Additional offset beyond base 64px margin
  }, [isMobile, sidebarWidth]);

  return (
    <NavigationBlockerProvider>
      <div className="min-h-screen flex flex-col">
        <Sidebar
          expanded={effectiveExpanded}
          onExpandedChange={() => {}} // No-op since we only use hover now
          onHoverChange={setIsSidebarHovered}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main
          className={cn(
            "flex-1 min-h-screen transition-transform duration-300 ease-out",
            isMobile ? "" : "md:ml-16"
          )}
          style={{
            '--sidebar-width': `${sidebarWidth}px`,
            transform: transformOffset > 0 ? `translateX(${transformOffset}px)` : 'translateX(0)',
            willChange: isMobile ? 'auto' : 'transform',
          } as React.CSSProperties}
        >
          <Header onMobileMenuToggle={toggleMobileMenu} />
          <div className="px-4 sm:px-6 lg:px-8 py-0">
            <Outlet />
          </div>
        </main>
      </div>
    </NavigationBlockerProvider>
  );
}