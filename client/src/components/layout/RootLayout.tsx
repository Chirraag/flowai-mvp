import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavigationBlockerProvider } from "@/context/NavigationBlockerContext";

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Auto-expand logic: expand on hover or manual toggle (desktop only)
  const effectiveExpanded = isMobile ? false : (sidebarExpanded || isSidebarHovered);
  
  // Dynamic dimensions
  const sidebarWidth = effectiveExpanded ? 256 : 64; // px
  return (
    <NavigationBlockerProvider>
      <div className="min-h-screen flex flex-col">
        <Sidebar
          expanded={effectiveExpanded}
          onExpandedChange={setSidebarExpanded}
          onHoverChange={setIsSidebarHovered}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main
          className={cn(
            "flex-1 min-h-screen transition-all duration-300 ease-in-out",
            isMobile ? "" : "md:ml-[var(--sidebar-width)]"
          )}
          style={{
            '--sidebar-width': `${sidebarWidth}px`
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
