import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigationBlocker } from '@/context/NavigationBlockerContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ChevronDown, ChevronUp, Plus, Check, Search } from 'lucide-react';
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
  onExpandRequired?: () => void;
  onOrganizationSwitched?: () => void;
}

export default function OrganizationSwitcher({
  isCollapsed = false,
  onExpandRequired,
  onOrganizationSwitched,
}: OrganizationSwitcherProps) {
  const { user, switchOrganization, canCreateOrganizations } = useAuth();
  const { toast } = useToast();
  const { navigateWithoutBlock } = useNavigationBlocker();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    retell_workspace_id: "",
    api_key: "",
  });

  // Fetch organizations when component mounts or when expanded
  useEffect(() => {
    if (isExpanded && organizations.length === 0) {
      fetchOrganizations();
    }
  }, [isExpanded]);

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (isCollapsed && isExpanded) {
      setIsExpanded(false);
    }
  }, [isCollapsed, isExpanded]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get<OrganizationsResponse>("/auth/all-orgs");
      if (response.success) {
        setOrganizations(response.organisations);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
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
      const targetOrg = organizations.find((org) => org.id === orgId);

      await switchOrganization(orgId);

      const currentPath = location.pathname;
      const pathParts = currentPath.split('/');
      const pageRoute = pathParts.slice(2).join('/') || 'launchpad';

      navigateWithoutBlock(`/${orgId}/${pageRoute}`);

      toast({
        title: "Organization Switched",
        description: `Switched to ${targetOrg?.name || 'selected organization'}`,
      });
    } catch (error) {
      console.error("Failed to switch organization:", error);
      toast({
        title: "Error",
        description: "Failed to switch organization",
        variant: "destructive",
      });
    } finally {
      setSwitching(null);
      setIsExpanded(false);
      onOrganizationSwitched?.();
    }
  };

  const handleAddOrganization = () => {
    setIsExpanded(false);
    setShowAddDialog(true);
    // Reset form data
    setFormData({
      name: "",
      retell_workspace_id: "",
      api_key: "",
    });
  };

  const handleCreateOrganization = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.retell_workspace_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Retell workspace ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.api_key.trim()) {
      toast({
        title: "Validation Error",
        description: "API key is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post("/auth/create-organisation", {
        name: formData.name.trim(),
        retell_workspace_id: formData.retell_workspace_id.trim(),
        api_key: formData.api_key.trim(),
      });

      if (response.success && response.organisation?.id) {
        // Close dialog and reset form first
        setShowAddDialog(false);
        setFormData({ name: "", retell_workspace_id: "", api_key: "" });

        try {
          // Refresh the organizations list to include the new org
          await fetchOrganizations();

          // Switch to the new organization (no setTimeout needed)
          await switchOrganization(response.organisation.id);

          // Navigate to the new organization's launchpad
          navigateWithoutBlock(`/${response.organisation.id}/launchpad`);

          // Success toast with organization name from response
          toast({
            title: "Success",
            description: `Organization "${response.organisation.name}" created and selected`,
          });
        } catch (switchError) {
          console.error(
            "Failed to switch to new organization:",
            switchError,
          );
          toast({
            title: "Organization Created",
            description: `Organization "${response.organisation.name}" created successfully, but failed to switch. Please refresh the page and select it manually.`,
            variant: "destructive",
          });
        }
      } else if (response.success) {
        // Organization created but no ID returned
        setShowAddDialog(false);
        setFormData({ name: "", retell_workspace_id: "", api_key: "" });
        await fetchOrganizations();
        
        toast({
          title: "Success",
          description: `Organization "${formData.name}" created. Please select it from the list.`,
        });
      } else {
        throw new Error(response.message || "Failed to create organization");
      }
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    // Generate consistent colors based on organization name
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Filter organizations based on search term
  const filteredOrganizations = useMemo(() => {
    if (!searchTerm.trim()) return organizations;
    return organizations.filter(org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  const currentOrg = organizations.find((org) => org.id === user?.org_id) || {
    id: user?.org_id || 0,
    name: user?.org_name || "Unknown",
    isCurrent: true,
  };

  return (
    <div className="relative">
      {/* Main Organization Button */}
      <Button
        variant="outline"
        className={cn(
          "w-full h-10 hover:bg-gray-50 rounded-lg border-gray-200 bg-white transition-all duration-200",
          isCollapsed ? "justify-center px-2" : "justify-between px-3",
        )}
        onClick={() => {
          // If sidebar is collapsed and we're opening the dropdown, expand the sidebar first
          if (isCollapsed && !isExpanded && onExpandRequired) {
            onExpandRequired();
          }
          setIsExpanded(!isExpanded);
        }}
        title={isCollapsed ? currentOrg.name : undefined}
      >
        <div
          className={cn(
            "flex items-center min-w-0 h-6",
            isCollapsed ? "gap-0" : "gap-2 flex-1",
          )}
        >
          <div
            className={`w-6 h-6 ${getAvatarColor(currentOrg.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
          >
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
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
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

          <Card
            className={cn(
              "absolute top-full mt-1 shadow-xl border border-gray-200 z-50 bg-white rounded-lg overflow-hidden",
              isCollapsed ? "left-0 w-64" : "left-0 right-0", // Fixed width when collapsed
            )}
          >
            <CardContent className="p-0">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
                {/* Search Input */}
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border-gray-200"
                    />
                  </div>
                </div>

                {/* Add Organization Button - Only visible to super-admin */}
                {canCreateOrganizations() && (
                  <div className="px-3 pb-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto hover:bg-blue-50 rounded-lg border-0 text-blue-600 hover:text-blue-700"
                      onClick={handleAddOrganization}
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold">
                          Add organisation
                        </span>
                      </div>
                    </Button>
                  </div>
                )}
              </div>

              {/* Scrollable Organizations List */}
              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Loading organizations...
                    </span>
                  </div>
                ) : filteredOrganizations.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-sm text-gray-500">
                      {searchTerm.trim() ? "No organizations found" : "No organizations available"}
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredOrganizations.map((org) => (
                      <Button
                        key={org.id}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto hover:bg-blue-50 rounded-none border-0"
                        onClick={() => handleSwitchOrganization(org.id)}
                        disabled={switching === org.id}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div
                            className={`w-6 h-6 ${getAvatarColor(org.name)} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                          >
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Organization Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Organisation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organisation Name *</Label>
              <Input
                id="org-name"
                placeholder="e.g., Test Healthcare Clinic"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retell-workspace">Retell Workspace ID *</Label>
              <Input
                id="retell-workspace"
                placeholder="e.g., ws_abc123def456"
                value={formData.retell_workspace_id}
                onChange={(e) =>
                  handleInputChange("retell_workspace_id", e.target.value)
                }
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key *</Label>
              <Input
                id="api-key"
                placeholder="e.g., key_81827a38956f6979a50fccd47183"
                value={formData.api_key}
                onChange={(e) => handleInputChange("api_key", e.target.value)}
                disabled={isCreating}
                type="password"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={
                isCreating ||
                !formData.name.trim() ||
                !formData.retell_workspace_id.trim() ||
                !formData.api_key.trim()
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Organisation"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
