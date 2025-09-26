import { useAuth } from "@/context/AuthContext";
import { Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isMobile = useIsMobile();

  // Get page title from location
  const getPageTitle = () => {
    const pathParts = location.split("/");
    const page = pathParts[pathParts.length - 1];

    if (page === "launchpad") {
      return "Launchpad";
    }

    // AI Agents pages
    if (location.includes("ai-agents/scheduling")) {
      return "Scheduling Agent";
    }

    if (location.includes("ai-agents/patient-intake")) {
      return "Patient Intake Agent";
    }

    if (location.includes("ai-agents/customer-support")) {
      return "Customer Support Agent";
    }

    if (location.includes("/analytics")) {
      return "Analytics";
    }

    // Default fallback
    if (page === "" || location === "/") {
      return "Dashboard";
    }

    return "Flow AI";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex w-full items-center gap-3 px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {isMobile && (
            <button
              type="button"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role} • {user?.org_name}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
