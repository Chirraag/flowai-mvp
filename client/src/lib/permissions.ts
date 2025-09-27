// FlowAI RBAC Permission System
// Centralized permission logic that matches backend RBAC matrix

export type UserRole = "super-admin" | "customer-admin" | "core-team-member" | "observer" | "member" | "analytics-user";

const FEATURE_PERMISSIONS = {
  launchpad: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: true },
    "member": { read: true, write: true },
    "core-team-member": { read: true, write: false },
    "observer": { read: true, write: false },
    "analytics-user": { read: false, write: false },
  },
  "ai-agents": {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: true },
    "member": { read: true, write: true },
    "core-team-member": { read: true, write: false },
    "observer": { read: true, write: false },
    "analytics-user": { read: false, write: false },
  },
  analytics: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: true },
    "member": { read: true, write: true },
    "core-team-member": { read: false, write: false },
    "observer": { read: true, write: false },
    "analytics-user": { read: true, write: false },
  },
  members: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: true }, // can add members
    "member": { read: false, write: false },
    "core-team-member": { read: false, write: false },
    "observer": { read: false, write: false },
    "analytics-user": { read: false, write: false },
  },
} as const;

export const canReadFeature = (role: UserRole, feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
  return FEATURE_PERMISSIONS[feature]?.[role]?.read ?? false;
};

export const canWriteFeature = (role: UserRole, feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
  return FEATURE_PERMISSIONS[feature]?.[role]?.write ?? false;
};

export const canAccessPage = (role: UserRole, page: string): boolean => {
  // Map pages to features based on current navigation structure
  if (page.startsWith("ai-agents/")) return canReadFeature(role, "ai-agents");
  if (page === "launchpad") return canReadFeature(role, "launchpad");
  if (page === "analytics") return canReadFeature(role, "analytics");
  if (page === "members") return canReadFeature(role, "members");
  return false;
};

export const filterNavItemsByRole = (role: UserRole, navItems: any[]) => {
  return navItems.map(section => ({
    ...section,
    items: section.items
      .map((item: any) => {
        if (item.isDropdown) {
          const children = (item.children ?? []).filter((child: any) => canAccessPage(role, child.path));
          return children.length ? { ...item, children } : null;
        }
        return canAccessPage(role, item.path) ? item : null;
      })
      .filter(Boolean),
  })).filter((section: any) => section.items.length);
};

// Additional utility functions for specific use cases
export const isReadOnlyUser = (role: UserRole, feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
  return canReadFeature(role, feature) && !canWriteFeature(role, feature);
};

export const hasFullAccess = (role: UserRole, feature: keyof typeof FEATURE_PERMISSIONS): boolean => {
  return canReadFeature(role, feature) && canWriteFeature(role, feature);
};

// Member management specific permissions
export const canAddMembers = (role: UserRole): boolean => {
  return role === "super-admin" || role === "customer-admin";
};

export const canChangeRoles = (role: UserRole): boolean => {
  return role === "super-admin";
};

export const canDeleteMembers = (role: UserRole): boolean => {
  return role === "super-admin";
};
