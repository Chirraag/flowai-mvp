import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

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

export default function OrganizationSwitcher() {
  const { user, switchOrganization } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    retell_workspace_id: '',
    api_key: ''
  });

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
    setIsExpanded(false);
    setShowAddDialog(true);
    // Reset form data
    setFormData({
      name: '',
      retell_workspace_id: '',
      api_key: ''
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
      const response = await api.post('/auth/create-organisation', {
        name: formData.name.trim(),
        retell_workspace_id: formData.retell_workspace_id.trim(),
        api_key: formData.api_key.trim()
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `Organization "${formData.name}" created successfully`,
        });
        
        // Close dialog and refresh organizations list
        setShowAddDialog(false);
        setFormData({ name: '', retell_workspace_id: '', api_key: '' });
        
        // Redirect to the new organization
        // Check for orgId in different possible response structures
        const orgId = response.orgId || response.data?.orgId || response.organisation?.id;
        
        if (orgId) {
          console.log('Redirecting to new organization:', orgId);
          window.location.href = `/${orgId}/launchpad`;
        } else {
          console.log('No orgId found in response, refreshing list instead');
          // Fallback: refresh organizations list if no orgId returned
          if (isExpanded) {
            await fetchOrganizations();
          }
        }
      } else {
        throw new Error(response.message || 'Failed to create organization');
      }
    } catch (error: any) {
      console.error('Failed to create organization:', error);
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        className="w-full justify-between p-3 h-auto hover:bg-gray-50 rounded-lg border-gray-200 bg-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 ${getAvatarColor(currentOrg.name)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
            {getInitials(currentOrg.name)}
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentOrg.name}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>

      {/* Expanded Organizations List */}
      {isExpanded && (
        <>
          {/* Click outside to close overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          <Card className="absolute top-full left-0 right-0 mt-1 shadow-xl border border-gray-200 z-50 bg-white rounded-lg overflow-hidden">
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
                        <span className="text-sm font-semibold">Add organisation</span>
                      </div>
                    </Button>
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
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retell-workspace">Retell Workspace ID *</Label>
              <Input
                id="retell-workspace"
                placeholder="e.g., ws_abc123def456"
                value={formData.retell_workspace_id}
                onChange={(e) => handleInputChange('retell_workspace_id', e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key *</Label>
              <Input
                id="api-key"
                placeholder="e.g., key_81827a38956f6979a50fccd47183"
                value={formData.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
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
              disabled={isCreating || !formData.name.trim() || !formData.retell_workspace_id.trim() || !formData.api_key.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Organisation'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}