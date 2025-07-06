// Types for user and roles
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationMemberships?: OrganizationMember[];
}

export type Role = 'SUPER_ADMIN' | 'MODERATOR' | 'OPERATOR' | 'VIEWER';

export interface OrganizationMember {
  id: string;
  user: User;
  organization: Organization;
  role: Role;
  joinedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 