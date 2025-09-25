export interface Member {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  accessType: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  isPrimaryOrg: boolean;
  hasMultipleOrgs: boolean | null;
  hasGlobalAccess: boolean;
}

export interface AddMemberRequest {
  email: string;
  firstName: string;
  username: string;
  role: string;
  lastName?: string;
}

export interface AddMemberResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    orgId: number;
  };
}

export interface MembersResponse {
  success: boolean;
  data: {
    orgId: number;
    totalMembers: number;
    visibilityRule: string;
    members: Member[];
    membersByRole: Record<string, Member[]>;
    summary: {
      totalActive: number;
      byRole: Record<string, number>;
      primaryOrgMembers: number;
      assignedMembers: number;
      globalAccessMembers: number;
    };
  };
}