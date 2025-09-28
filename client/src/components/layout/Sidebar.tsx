import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Rocket, ChevronDown, Phone } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { filterNavItemsByRole, UserRole } from "@/lib/permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OrganizationSwitcher from "./OrganizationSwitcher";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  isDropdown?: boolean;
  children?: NavigationItem[];
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface SidebarProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onHoverChange: (hovered: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({
  expanded,
  onExpandedChange,
  onHoverChange,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const isMobile = useIsMobile();
  
  // Filter navigation items based on user role
  const visibleSections = filterNavItemsByRole(
    (userRole || "observer") as UserRole, 
    NAVIGATION_ITEMS
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [collapsedFlyoutFor, setCollapsedFlyoutFor] = useState<string | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen, setMobileMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  // Handle mobile menu item click
  const handleMobileMenuItemClick = () => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    const orgId = user?.org_id;
    if (orgId) {
      navigate(`/${orgId}/${path}`);
    } else {
      navigate(path);
    }
    handleMobileMenuItemClick();
  };

  // Helper function to check if a path is active
  const isPathActive = (itemPath: string) => {
    const orgId = user?.org_id;
    const fullPath = orgId ? `/${orgId}/${itemPath}` : itemPath;
    return location.pathname === fullPath;
  };

  // Helper function to check if any child path is active
  const isAnyChildActive = (children?: NavigationItem[]) => {
    return children?.some((child) => isPathActive(child.path)) || false;
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (itemName: string) => {
    const isOpening = dropdownOpen !== itemName;
    setDropdownOpen(dropdownOpen === itemName ? null : itemName);
    
    // Track which dropdown was intentionally opened for collapsed state
    if (isOpening) {
      setCollapsedFlyoutFor(itemName);
    } else {
      // If closing dropdown, clear collapsed flyout
      setCollapsedFlyoutFor(null);
    }
  };

  // Hover handlers for sidebar expansion (desktop only)
  const handleMouseEnter = () => {
    if (!isMobile) {
      // Clear any pending collapse timeout
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }
      onHoverChange(true);
      // Restore dropdown state when expanding if flyout was active
      if (collapsedFlyoutFor) {
        setDropdownOpen(collapsedFlyoutFor);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // Delay collapse by 300ms to prevent accidental closes
      collapseTimeoutRef.current = setTimeout(() => {
        // Close any open dropdown when collapsing, but keep flyout state
        setDropdownOpen(null);
        onHoverChange(false);
        collapseTimeoutRef.current = null;
      }, 300);
    }
  };

  // Click handler for manual toggle when collapsed
  const handleSidebarClick = () => {
    if (!isMobile && !expanded) {
      onExpandedChange(true);
    }
  };

  // Determine if labels should be shown
  const showLabels = expanded;

  const IconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      home: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      calendar: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      users: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      clipboard: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      "bar-chart-2": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      settings: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      sliders: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      briefcase: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      "user-check": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m9 12 2 2 4-4"
          />
        </svg>
      ),
      "users-multiple": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      activity: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M22 12h-4l-3 9L9 3l-3 9H2"
          />
        </svg>
      ),
      brain: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      book: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      "file-text": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      notes: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      database: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      info: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      "trending-up": (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      workflow: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4"
          />
        </svg>
      ),
      shield: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      bot: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      rocket: <Rocket className="h-5 w-5 mr-3" />,
      phone: <Phone className="h-5 w-5 mr-3" />,
    };

    return icons[iconName] || <div className="h-5 w-5" />;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-white border-r border-gray-200 z-20 transition-all duration-300 ease-in-out",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 w-64 transform",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
              )
            : cn(
                "fixed inset-y-0 flex flex-col",
                expanded ? "w-64" : "w-16"
              ),
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleSidebarClick}
      >
        <div className={cn(
          "flex items-center border-b border-gray-200 h-16 px-3",
          showLabels ? "justify-between" : "justify-center"
        )}>
          <div className="flex items-center">
            <img
              src={showLabels ? "/logo_flowai.png" : "/mini_logo.png"}
              alt="Flow AI"
              className={cn(
                "h-7 w-auto transition-all duration-200"
              )}
            />
          </div>
          {isMobile && (
            <button
              type="button"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Organization Switcher - always visible; icon-only when collapsed */}
        <div className={cn(
          "border-b border-gray-200",
          showLabels ? "px-3 py-3" : "px-2 py-2"
        )}>
          <OrganizationSwitcher isCollapsed={!showLabels} />
        </div>

        <nav className={cn(
          "flex-1 pt-2 pb-3 overflow-y-auto hide-scrollbar",
          showLabels ? "px-0" : "px-2"
        )}>
          {visibleSections.map((section, idx) => (
            <div key={idx}>
              {/* Section title - only show when expanded */}
              {showLabels && section.title && (
                <div className="px-4 mb-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-400">
                    {section.title}
                  </p>
                </div>
              )}
              {section.items.map((item: NavigationItem) => (
                <div key={item.path || item.name}>
                  {item.isDropdown ? (
                    <>
                      {/* Dropdown parent */}
                      <button
                        className={cn(
                          "transition-all duration-200 w-full text-left flex items-center",
                          showLabels 
                            ? "px-3 sm:px-3 py-1.5 mx-2 sm:mx-2 justify-between"
                            : "justify-center px-2 py-2 mx-1 rounded-lg",
                          isAnyChildActive(item.children) || dropdownOpen === item.name
                            ? "bg-orange-50 border-r-4 border-[#F48024] text-[#F48024]"
                            : "hover:bg-gray-50 text-gray-700",
                        )}
                        onClick={() => handleDropdownToggle(item.name)}
                        title={!showLabels ? item.name : undefined}
                      >
                        <div className="flex items-center">
                          <span className={cn(
                            "inline-flex",
                            showLabels ? "p-1 mr-2" : "p-1"
                          )}>
                            {IconComponent(item.icon)}
                          </span>
                          {showLabels && (
                            <span className="flex-1 break-words text-[13px] leading-5">
                              {item.name}
                            </span>
                          )}
                        </div>
                        {showLabels && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              dropdownOpen === item.name ? "rotate-180" : "",
                            )}
                          />
                        )}
                      </button>

                      {/* Dropdown children - only show when expanded and dropdown is open */}
                      {showLabels && dropdownOpen === item.name && item.children && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children?.map((child: NavigationItem) => (
                            <button
                              key={child.path}
                              className={cn(
                                "transition-colors duration-200 w-full text-left flex items-center px-3 py-1.5",
                                isPathActive(child.path)
                                  ? "bg-orange-50 border-r-4 border-[#F48024] text-[#F48024]"
                                  : "hover:bg-gray-50 text-gray-600",
                              )}
                              onClick={() => handleNavigation(child.path)}
                            >
                              <span className="p-1 mr-2 inline-flex">
                                {IconComponent(child.icon)}
                              </span>
                              <span className="flex-1 break-words text-[13px] leading-5">
                                {child.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Collapsed state: show child icons below parent when flyout is active */}
                      {!showLabels && collapsedFlyoutFor === item.name && item.children && (
                        <div className="mt-1 space-y-1">
                          {item.children?.map((child: NavigationItem) => (
                            <button
                              key={child.path}
                              className={cn(
                                "transition-colors duration-200 w-full flex items-center justify-center px-2 py-2 mx-1 rounded-lg",
                                isPathActive(child.path)
                                  ? "bg-orange-50 text-[#F48024]"
                                  : "hover:bg-gray-50 text-gray-600",
                              )}
                              onClick={() => handleNavigation(child.path)}
                              title={child.name}
                            >
                              <span className="p-1 inline-flex">{IconComponent(child.icon)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Regular navigation item */
                    <button
                      className={cn(
                        "transition-all duration-200 w-full text-left flex items-center",
                        showLabels 
                          ? "px-3 sm:px-3 py-1.5 mx-2 sm:mx-2"
                          : "justify-center px-2 py-2 mx-1 rounded-lg",
                        isPathActive(item.path)
                          ? "bg-orange-50 border-r-4 border-[#F48024] text-[#F48024]"
                          : "hover:bg-gray-50 text-gray-700",
                      )}
                      onClick={() => handleNavigation(item.path)}
                      title={!showLabels ? item.name : undefined}
                    >
                      <span className={cn(
                        "inline-flex",
                        showLabels ? "p-1 mr-2" : "p-1"
                      )}>
                        {IconComponent(item.icon)}
                      </span>
                      {showLabels && (
                        <span className="flex-1 break-words text-[13px] leading-5">{item.name}</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>


        <div className={cn(
          "border-t border-gray-200",
          showLabels ? "px-4 py-4" : "px-2 py-4"
        )}>
          {/* User Info */}
          <div>
            <div className={cn(
              "flex items-center",
              !showLabels && "justify-center"
            )}>
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {user?.username
                    ? user.username.substring(0, 2).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {showLabels && (
                <div className="ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {user?.role || "User"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
