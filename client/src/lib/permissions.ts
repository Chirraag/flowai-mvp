// FlowAI RBAC Permission System
// Centralized permission logic that matches backend RBAC matrix

export type UserRole = "super-admin" | "customer-admin" | "observer" | "fde" | "account-executive" | "customer-user";

const FEATURE_PERMISSIONS = {
  launchpad: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: false },
    "fde": { read: true, write: true },
    "account-executive": { read: true, write: true },
    "observer": { read: true, write: false },
    "customer-user": { read: false, write: false },
  },
  "ai-agents": {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: false },
    "fde": { read: true, write: true },
    "account-executive": { read: true, write: true },
    "observer": { read: true, write: false },
    "customer-user": { read: false, write: false },
  },
  analytics: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: false },
    "fde": { read: true, write: true },
    "account-executive": { read: true, write: true },
    "observer": { read: true, write: false },
    "customer-user": { read: true, write: false },
  },
  members: {
    "super-admin": { read: true, write: true },
    "customer-admin": { read: true, write: true }, // can add members
    "fde": { read: false, write: false },
    "account-executive": { read: false, write: false },
    "observer": { read: false, write: false },
    "customer-user": { read: false, write: false },
  },
  organizations: {
    "super-admin": { read: true, write: true }, // can create/manage organizations
    "customer-admin": { read: true, write: false }, // can view organizations but not create
    "fde": { read: true, write: false }, // can view organizations but not create
    "account-executive": { read: true, write: false }, // can view organizations but not create
    "observer": { read: true, write: false }, // can view organizations but not create
    "customer-user": { read: false, write: false }, // no organization access
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

// Document management specific permissions
export const canUploadLaunchpadDocuments = (role: UserRole): boolean => {
  return role === "super-admin" || role === "fde" || role === "account-executive";
};

// Organization management specific permissions
export const canCreateOrganizations = (role: UserRole): boolean => {
  return role === "super-admin";
};

// Role-based default page routing
export const getDefaultPageForRole = (role: UserRole): string => {
  switch (role) {
    case "customer-user":
      return "analytics";
    case "super-admin":
    case "customer-admin":
    case "fde":
    case "account-executive":
    case "observer":
    default:
      return "launchpad";
  }
};
