import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Organization {
  id: number;
  name: string;
  isCurrent: boolean;
}

interface OrganizationsResponse {
  success: boolean;
  organisations: Organization[];
  currentOrgId: number;
  currentOrgName: string;
  accessType: string;
}

interface OrganizationSwitcherProps {
  isCollapsed?: boolean;
}

export default function OrganizationSwitcher({ isCollapsed = false }: OrganizationSwitcherProps) {
  const { user, switchOrganization } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  // Fetch organizations when component mounts or when expanded
  useEffect(() => {
    if (isExpanded && organizations.length === 0) {
      fetchOrganizations();
    }
  }, [isExpanded]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get<OrganizationsResponse>('/auth/all-orgs');
      if (response.success) {
        setOrganizations(response.organisations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId: number) => {
    if (orgId === user?.org_id) {
      setIsExpanded(false);
      return;
    }

    setSwitching(orgId);
    try {
      const response = await api.post('/auth/select-org', { orgId });

      if (response.success && response.token && response.user) {
        // Update tokens
        localStorage.setItem('auth_token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }

        // Navigate to the new organization's launchpad
        window.location.href = `/${orgId}/launchpad`;
      }

      toast({
        title: "Organization Switched",
        description: `Switched to ${organizations.find(org => org.id === orgId)?.name}`,
      });
    } catch (error) {
      console.error('Failed to switch organization:', error);
      toast({
        title: "Error",
        description: "Failed to switch organization",
        variant: "destructive",
      });
    } finally {
      setSwitching(null);
      setIsExpanded(false);
    }
  };

  const handleAddOrganization = () => {
    // For now, show a toast - this would typically open a modal or navigate to a creation page
    toast({
      title: "Add Organization",
      description: "Organization creation feature coming soon",
    });
    setIsExpanded(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    // Generate consistent colors based on organization name
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const currentOrg = organizations.find(org => org.id === user?.org_id) || {
    id: user?.org_id || 0,
    name: user?.org_name || 'Unknown',
    isCurrent: true
  };

  return (
    <div className="relative">
      {/* Main Organization Button */}
      <Button
        variant="outline"
        className={cn(
          "w-full h-10 hover:bg-gray-50 rounded-lg border-gray-200 bg-white transition-all duration-200",
          isCollapsed ? "justify-center px-2" : "justify-between px-3"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isCollapsed ? currentOrg.name : undefined}
      >
        <div className={cn(
          "flex items-center min-w-0 h-6",
          isCollapsed ? "gap-0" : "gap-2 flex-1"
        )}>
          <div className={`w-6 h-6 ${getAvatarColor(currentOrg.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
            {getInitials(currentOrg.name)}
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-5">
                {currentOrg.name}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </Button>

      {/* Expanded Organizations List */}
      {isExpanded && (
        <>
          {/* Click outside to close overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          <Card className={cn(
            "absolute top-full mt-1 shadow-xl border border-gray-200 z-50 bg-white rounded-lg overflow-hidden",
            isCollapsed ? "left-0 w-64" : "left-0 right-0" // Fixed width when collapsed
          )}>
            <CardContent className="p-0">
              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading organizations...</span>
                  </div>
                ) : (
                  <div className="py-2">
                    {organizations.map((org) => (
                      <Button
                        key={org.id}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto hover:bg-blue-50 rounded-none border-0"
                        onClick={() => handleSwitchOrganization(org.id)}
                        disabled={switching === org.id}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div className={`w-6 h-6 ${getAvatarColor(org.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}>
                            {getInitials(org.name)}
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {org.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {org.id === user?.org_id && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            {switching === org.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}

                    {/* Separator with subtle styling */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Add Organization Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-blue-50 rounded-none border-0 text-blue-600 hover:text-blue-700"
                      onClick={handleAddOrganization}
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-semibold">Add another workspace</span>
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}