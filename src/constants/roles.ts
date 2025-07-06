// Constants for roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MODERATOR: 'MODERATOR',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    canManageUsers: true,
    canManageOrganizations: true,
    canManageDrones: true,
    canManageMissions: true,
    canManageSites: true,
    canViewAnalytics: true,
    canViewAllOrganizations: true,
  },
  [ROLES.MODERATOR]: {
    canManageUsers: true,
    canManageOrganizations: false,
    canManageDrones: true,
    canManageMissions: true,
    canManageSites: true,
    canViewAnalytics: true,
    canViewAllOrganizations: false,
  },
  [ROLES.OPERATOR]: {
    canManageUsers: false,
    canManageOrganizations: false,
    canManageDrones: false,
    canManageMissions: true,
    canManageSites: false,
    canViewAnalytics: true,
    canViewAllOrganizations: false,
  },
  [ROLES.VIEWER]: {
    canManageUsers: false,
    canManageOrganizations: false,
    canManageDrones: false,
    canManageMissions: false,
    canManageSites: false,
    canViewAnalytics: true,
    canViewAllOrganizations: false,
  },
} as const; 