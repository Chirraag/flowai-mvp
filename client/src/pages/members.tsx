import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Calendar, Shield, Globe, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/lib/members.queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Member } from "@/types/members";

export default function MembersPage() {
  const { user } = useAuth();
  const orgId = user?.org_id;

  const { data: membersData, isLoading, error } = useMembers(orgId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
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

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessTypeBadgeColor = (accessType: string) => {
    switch (accessType.toLowerCase()) {
      case 'primary':
        return 'bg-green-100 text-green-800';
      case 'global_access':
        return 'bg-purple-100 text-purple-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
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
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Members
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Loading workspace members...
            </p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Members
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage workspace members
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load members. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!membersData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Members
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage workspace members
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-600">No members data available for this workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Members
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage workspace members and permissions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{membersData.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-green-600">{membersData.summary.totalActive}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Primary Org</p>
                <p className="text-2xl font-bold text-purple-600">{membersData.summary.primaryOrgMembers}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Global Access</p>
                <p className="text-2xl font-bold text-orange-600">{membersData.summary.globalAccessMembers}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workspace Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membersData.members.map((member: Member) => (
              <Card key={member.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={`${getAvatarColor(member.fullName)} text-white font-semibold`}>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {member.fullName}
                        </h3>
                        {member.isPrimaryOrg && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Primary
                          </Badge>
                        )}
                        {member.hasGlobalAccess && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Global
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">@{member.username}</p>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Last login: {formatDate(member.lastLogin)}</span>
                        </div>
                      </div>

                      {/* Role and Access Type */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getRoleBadgeColor(member.role)} variant="secondary">
                          {member.role}
                        </Badge>
                        <Badge className={getAccessTypeBadgeColor(member.accessType)} variant="secondary">
                          {member.accessType.replace('_', ' ')}
                        </Badge>
                        <Badge className={member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="secondary">
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {membersData.members.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">This workspace doesn't have any members yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members by Role */}
      {Object.keys(membersData.membersByRole).length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Members by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(membersData.membersByRole).map(([role, roleMembers]) => (
                <div key={role}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {role.replace('-', ' ')}
                    </h3>
                    <Badge className={getRoleBadgeColor(role)} variant="secondary">
                      {roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roleMembers.map((member: Member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${getAvatarColor(member.fullName)} text-white text-sm font-semibold`}>
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {member.isPrimaryOrg && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Primary
                            </Badge>
                          )}
                          {member.hasGlobalAccess && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              Global
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}