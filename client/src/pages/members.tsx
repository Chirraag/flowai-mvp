import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Plus, Loader as Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMembers, useAddMember } from "@/lib/members.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert as AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils";
import type { Member, AddMemberRequest } from "@/types/members";

const ROLE_OPTIONS = [
  "super-admin",
  "observer",
  "fde",
  "account-executive",
  "customer-admin",
  "customer-user"
];

const CUSTOMER_ADMIN_ALLOWED_ROLES = [
  "customer-admin",
  "customer-user"
];

export default function MembersPage() {
  const { user, canAddMembers, canChangeRoles } = useAuth();
  const { toast } = useToast();
  const orgId = user?.org_id;

  const { data: membersData, isLoading, error } = useMembers(orgId);
  const addMemberMutation = useAddMember(orgId);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AddMemberRequest>({
    email: "",
    firstName: "",
    role: "",
    username: "",
    lastName: "",
  });

  // Scroll-aware header state
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Use permission utilities instead of direct role checks
  const canAddMembersPermission = canAddMembers();
  const canChangeRolesPermission = canChangeRoles();

  // Get available roles based on user's permissions
  const getAvailableRoles = () => {
    if (canChangeRolesPermission) {
      // Super-admin can assign all roles
      return ROLE_OPTIONS;
    } else if (canAddMembersPermission) {
      // Customer-admin can only assign limited roles
      return CUSTOMER_ADMIN_ALLOWED_ROLES;
    }
    return [];
  };

  // Scroll detection effect for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10); // Reduced trigger threshold for smoother animation
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: keyof AddMemberRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMember = async () => {
    // Validate required fields
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName.trim()) {
      toast({
        title: "Validation Error", 
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Validation Error",
        description: "Role is required", 
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Payload being sent:', JSON.stringify(formData, null, 2));
      await addMemberMutation.mutateAsync(formData);

      toast({
        title: "Success",
        description: "Member added successfully. Welcome email has been sent with login credentials.",
      });

      // Reset form and close dialog
      setFormData({
        email: "",
        firstName: "",
        role: "",
        username: "",
        lastName: "",
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to add member:', error);
      const errorToast = handleApiError(error, { action: "add member" });
      toast(errorToast);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return 'bg-red-100 text-red-800';
      case 'customer-admin':
        return 'bg-orange-100 text-orange-800';
      case 'core-team-member':
        return 'bg-blue-100 text-blue-800';
      case 'analytics-user':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'observer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200">
        <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
          isScrolled
            ? 'p-1.5 shadow-lg shadow-black/10'
            : 'p-2 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-[#F48024]" />
              </div>
              <CardTitle className="text-lg font-semibold">Members</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#e6eff7] text-sm">Loading workspace members...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
            <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200">
        <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
          isScrolled
            ? 'p-1.5 shadow-lg shadow-black/10'
            : 'p-2 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-[#F48024]" />
              </div>
              <CardTitle className="text-lg font-semibold">Members</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#e6eff7] text-sm">Manage workspace members</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert variant="destructive" className="border-[#c0352b]/20 bg-red-50/90">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load members. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!membersData) {
    return (
      <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200">
        <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
          isScrolled
            ? 'p-1.5 shadow-lg shadow-black/10'
            : 'p-2 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-[#F48024]" />
              </div>
              <CardTitle className="text-lg font-semibold">Members</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#e6eff7] text-sm">Manage workspace members</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-slate-600">No members data available for this workspace.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200">
      <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
        isScrolled
          ? 'p-1.5 shadow-lg shadow-black/10'
          : 'p-2 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#F48024]" />
            </div>
            <CardTitle className="text-lg font-semibold">Members</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* Add Member Button - only for users with add members permission */}
            {canAddMembersPermission && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-[#f49024] hover:bg-[#d87f1f] text-white h-8 px-3 text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#1C275E]">Add New Member</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black uppercase tracking-wide">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="member@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={addMemberMutation.isPending}
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black uppercase tracking-wide">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        disabled={addMemberMutation.isPending}
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black uppercase tracking-wide">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        disabled={addMemberMutation.isPending}
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black uppercase tracking-wide">Username *</Label>
                      <Input
                        id="username"
                        placeholder="john.doe"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        disabled={addMemberMutation.isPending}
                        className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-black uppercase tracking-wide">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange("role", value)}
                        disabled={addMemberMutation.isPending}
                      >
                        <SelectTrigger className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRoles().map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={addMemberMutation.isPending}
                      className="border-[#cbd5e1] hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMember}
                      disabled={
                        addMemberMutation.isPending ||
                        !formData.email.trim() ||
                        !formData.firstName.trim() ||
                        !formData.username.trim() ||
                        !formData.role
                      }
                      className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#f49024]/20"
                    >
                      {addMemberMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Member"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{membersData.totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-[#F48024]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Active Members</p>
                  <p className="text-2xl font-bold text-green-600">{membersData.summary.totalActive}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card className="border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
          <CardHeader className="bg-[#eef2ff] text-[#1C275E] p-4 border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-[#F48024]" />
              </div>
              Workspace Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200/70 hover:bg-slate-50/50">
                  <TableHead className="px-6 py-3 text-sm font-semibold text-black uppercase tracking-wide">First Name</TableHead>
                  <TableHead className="px-6 py-3 text-sm font-semibold text-black uppercase tracking-wide">Last Name</TableHead>
                  <TableHead className="px-6 py-3 text-sm font-semibold text-black uppercase tracking-wide">Email</TableHead>
                  <TableHead className="px-6 py-3 text-sm font-semibold text-black uppercase tracking-wide">Role</TableHead>
                  <TableHead className="px-6 py-3 text-sm font-semibold text-black uppercase tracking-wide">Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersData.members.map((member: Member) => (
                  <TableRow key={member.id} className="border-b border-slate-200/50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="px-6 py-4 font-medium">{member.firstName}</TableCell>
                    <TableCell className="px-6 py-4">{member.lastName}</TableCell>
                    <TableCell className="px-6 py-4">{member.email}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={getRoleBadgeColor(member.role)} variant="secondary">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(member.lastLogin)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Empty state */}
            {membersData.members.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                <p className="text-slate-600">This workspace doesn't have any members yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}