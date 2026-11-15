/**
 * Centralized Role-Based Access Control (RBAC) Service for ElderCare AI
 * 
 * Provides consistent, enforceable authorization across the UI and data layer.
 * 
 * Security Architecture:
 * - Fail closed: any missing, undefined, or unknown role/user is strictly denied.
 * - Explicit permissions: actions must be explicitly granted; no implicit wildcards.
 * - Role validation: input roles from client state or UI are strictly validated against known enum.
 * - Separation of concerns: seniors view their own records; clinical caregivers manage prescriptions;
 *   authorized family proxies manage non-clinical proxy affairs and emergency preferences.
 * 
 * NOTE ON PROTOTYPE LIMITATION:
 * This frontend implementation enforces client-side authorization and protects data actions
 * against unauthorized transitions in the browser layer. In a production environment, authorization
 * checks must also be enforced server-side (e.g., Firebase Security Rules and Cloud Functions).
 */

import { UserProfile, UserRole } from '../types';

export type Permission =
  | 'medications:view'
  | 'prescriptions:add'
  | 'prescriptions:edit'
  | 'prescriptions:delete'
  | 'medical_id:view'
  | 'medical_id:edit'
  | 'dnr:edit'
  | 'doses:record';

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

// Base permission mapping by role
const BASE_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  elderly: [
    'medications:view',
    'medical_id:view',
    'doses:record'
  ],
  caregiver: [
    'medications:view',
    'prescriptions:add',
    'prescriptions:edit',
    'prescriptions:delete',
    'medical_id:view',
    'medical_id:edit',
    'dnr:edit',
    'doses:record'
  ],
  family: [
    'medications:view',
    'medical_id:view',
    'doses:record'
    // 'medical_id:edit' and 'dnr:edit' require explicit isAuthorizedProxy === true
  ]
};

export class RBACService {
  /**
   * Validate if a given value is a valid, recognized UserRole.
   */
  public isValidRole(role: unknown): role is UserRole {
    return role === 'elderly' || role === 'family' || role === 'caregiver';
  }

  /**
   * Evaluate whether a user holds a specific permission.
   * Fails closed if user is null/undefined or role is invalid.
   */
  public hasPermission(user: UserProfile | null | undefined, permission: Permission): boolean {
    if (!user || typeof user !== 'object') {
      return false; // Fail closed: unauthenticated
    }

    if (!user.role || !this.isValidRole(user.role)) {
      return false; // Fail closed: invalid or tampered role
    }

    // Check base permissions for the role
    const baseList = BASE_ROLE_PERMISSIONS[user.role] || [];
    if (baseList.includes(permission)) {
      return true;
    }

    // Role-specific authorization conditions:
    // Authorized Family Proxy holds medical_id:edit and dnr:edit
    if (user.role === 'family' && user.isAuthorizedProxy === true) {
      if (permission === 'medical_id:edit' || permission === 'dnr:edit') {
        return true;
      }
    }

    return false;
  }

  /**
   * Detailed authorization check with explanatory audit reasons
   */
  public authorize(user: UserProfile | null | undefined, permission: Permission): AuthorizationResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'Authentication required. No active user profile.'
      };
    }

    if (!user.role || !this.isValidRole(user.role)) {
      return {
        allowed: false,
        reason: `Access Denied: Unrecognized or invalid security role "${String((user as any)?.role)}".`
      };
    }

    if (this.hasPermission(user, permission)) {
      return { allowed: true };
    }

    // Construct specific clinical audit reasons
    if (user.role === 'elderly') {
      if (permission.startsWith('prescriptions:')) {
        return {
          allowed: false,
          reason: 'Access Denied: Prescription changes require licensed clinical caregiver oversight.'
        };
      }
      if (permission === 'dnr:edit' || permission === 'medical_id:edit') {
        return {
          allowed: false,
          reason: 'Access Denied: Senior Medical ID and DNR preferences are managed by authorized proxies.'
        };
      }
    }

    if (user.role === 'family') {
      if (permission.startsWith('prescriptions:')) {
        return {
          allowed: false,
          reason: 'Access Denied: Prescription creation and deletion requires clinical caregiver authority.'
        };
      }
      if ((permission === 'medical_id:edit' || permission === 'dnr:edit') && !user.isAuthorizedProxy) {
        return {
          allowed: false,
          reason: 'Access Denied: Modifying Medical ID requires explicit Healthcare Proxy authorization.'
        };
      }
    }

    return {
      allowed: false,
      reason: `Access Denied: Role "${user.role}" is not authorized for action "${permission}".`
    };
  }

  /**
   * Enforce permission in the data layer; throws error if unauthorized.
   */
  public assertPermission(user: UserProfile | null | undefined, permission: Permission): void {
    const auth = this.authorize(user, permission);
    if (!auth.allowed) {
      throw new Error(auth.reason || `Permission denied: ${permission}`);
    }
  }
}

export const rbacService = new RBACService();
