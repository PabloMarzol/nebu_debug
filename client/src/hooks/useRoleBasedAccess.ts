import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export type UserRole = 
  | "admin"
  | "manager"
  | "customer_support"
  | "sales"
  | "marketing"
  | "compliance"
  | "analyst"
  | "operations"
  | "client"
  | "guest";

export type WorkspacePermission = {
  workspace: string;
  access: "full" | "read" | "limited" | "none";
  features?: string[];
};

export interface RolePermissions {
  role: UserRole;
  workspaces: WorkspacePermission[];
  canCreateTickets: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canAccessAdmin: boolean;
  canViewFinancials: boolean;
  canManageCompliance: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    role: "admin",
    workspaces: [
      { workspace: "customer-ops", access: "full" },
      { workspace: "sales-revenue", access: "full" },
      { workspace: "marketing-growth", access: "full" },
      { workspace: "compliance-risk", access: "full" },
      { workspace: "exchange-ops", access: "full" },
      { workspace: "analytics-intelligence", access: "full" }
    ],
    canCreateTickets: true,
    canViewReports: true,
    canManageUsers: true,
    canAccessAdmin: true,
    canViewFinancials: true,
    canManageCompliance: true
  },
  manager: {
    role: "manager",
    workspaces: [
      { workspace: "customer-ops", access: "full" },
      { workspace: "sales-revenue", access: "full" },
      { workspace: "marketing-growth", access: "read" },
      { workspace: "compliance-risk", access: "read" },
      { workspace: "exchange-ops", access: "read" },
      { workspace: "analytics-intelligence", access: "full" }
    ],
    canCreateTickets: true,
    canViewReports: true,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: true,
    canManageCompliance: false
  },
  customer_support: {
    role: "customer_support",
    workspaces: [
      { workspace: "customer-ops", access: "full", features: ["support", "customers", "onboarding"] },
      { workspace: "sales-revenue", access: "read" },
      { workspace: "marketing-growth", access: "none" },
      { workspace: "compliance-risk", access: "limited", features: ["kyc-review"] },
      { workspace: "exchange-ops", access: "none" },
      { workspace: "analytics-intelligence", access: "limited", features: ["customer-analytics"] }
    ],
    canCreateTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  },
  sales: {
    role: "sales",
    workspaces: [
      { workspace: "customer-ops", access: "limited", features: ["customers", "accounts"] },
      { workspace: "sales-revenue", access: "full" },
      { workspace: "marketing-growth", access: "read" },
      { workspace: "compliance-risk", access: "none" },
      { workspace: "exchange-ops", access: "none" },
      { workspace: "analytics-intelligence", access: "limited", features: ["sales-analytics"] }
    ],
    canCreateTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  },
  marketing: {
    role: "marketing",
    workspaces: [
      { workspace: "customer-ops", access: "read" },
      { workspace: "sales-revenue", access: "read" },
      { workspace: "marketing-growth", access: "full" },
      { workspace: "compliance-risk", access: "none" },
      { workspace: "exchange-ops", access: "none" },
      { workspace: "analytics-intelligence", access: "limited", features: ["marketing-analytics"] }
    ],
    canCreateTickets: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  },
  compliance: {
    role: "compliance",
    workspaces: [
      { workspace: "customer-ops", access: "limited", features: ["kyc", "onboarding"] },
      { workspace: "sales-revenue", access: "none" },
      { workspace: "marketing-growth", access: "none" },
      { workspace: "compliance-risk", access: "full" },
      { workspace: "exchange-ops", access: "limited", features: ["compliance", "risk"] },
      { workspace: "analytics-intelligence", access: "limited", features: ["compliance-analytics"] }
    ],
    canCreateTickets: true,
    canViewReports: true,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: true
  },
  analyst: {
    role: "analyst",
    workspaces: [
      { workspace: "customer-ops", access: "read" },
      { workspace: "sales-revenue", access: "read" },
      { workspace: "marketing-growth", access: "read" },
      { workspace: "compliance-risk", access: "read" },
      { workspace: "exchange-ops", access: "read" },
      { workspace: "analytics-intelligence", access: "full" }
    ],
    canCreateTickets: false,
    canViewReports: true,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: true,
    canManageCompliance: false
  },
  operations: {
    role: "operations",
    workspaces: [
      { workspace: "customer-ops", access: "read" },
      { workspace: "sales-revenue", access: "none" },
      { workspace: "marketing-growth", access: "none" },
      { workspace: "compliance-risk", access: "read" },
      { workspace: "exchange-ops", access: "full" },
      { workspace: "analytics-intelligence", access: "limited", features: ["operations-analytics"] }
    ],
    canCreateTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  },
  client: {
    role: "client",
    workspaces: [
      { workspace: "customer-ops", access: "limited", features: ["support-tickets"] },
      { workspace: "sales-revenue", access: "none" },
      { workspace: "marketing-growth", access: "none" },
      { workspace: "compliance-risk", access: "none" },
      { workspace: "exchange-ops", access: "none" },
      { workspace: "analytics-intelligence", access: "none" }
    ],
    canCreateTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  },
  guest: {
    role: "guest",
    workspaces: [
      { workspace: "customer-ops", access: "none" },
      { workspace: "sales-revenue", access: "none" },
      { workspace: "marketing-growth", access: "none" },
      { workspace: "compliance-risk", access: "none" },
      { workspace: "exchange-ops", access: "none" },
      { workspace: "analytics-intelligence", access: "none" }
    ],
    canCreateTickets: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canViewFinancials: false,
    canManageCompliance: false
  }
};

export function useRoleBasedAccess() {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [permissions, setPermissions] = useState<RolePermissions>(rolePermissions.guest);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Determine user role from user data
      const role = determineUserRole(user);
      setUserRole(role);
      setPermissions(rolePermissions[role]);
    } else {
      setUserRole("guest");
      setPermissions(rolePermissions.guest);
    }
  }, [isAuthenticated, user]);

  const hasWorkspaceAccess = (workspaceId: string, requiredAccess: "full" | "read" | "limited" = "read") => {
    const workspacePermission = permissions.workspaces.find(w => w.workspace === workspaceId);
    if (!workspacePermission || workspacePermission.access === "none") return false;
    
    if (requiredAccess === "full") return workspacePermission.access === "full";
    if (requiredAccess === "read") return ["full", "read", "limited"].includes(workspacePermission.access);
    if (requiredAccess === "limited") return ["full", "limited"].includes(workspacePermission.access);
    
    return false;
  };

  const hasFeatureAccess = (workspaceId: string, feature: string) => {
    const workspacePermission = permissions.workspaces.find(w => w.workspace === workspaceId);
    if (!workspacePermission || workspacePermission.access === "none") return false;
    if (workspacePermission.access === "full") return true;
    if (workspacePermission.features) {
      return workspacePermission.features.includes(feature);
    }
    return false;
  };

  const getAccessibleWorkspaces = () => {
    return permissions.workspaces.filter(w => w.access !== "none");
  };

  const isInternalUser = () => {
    return !["client", "guest"].includes(userRole);
  };

  const isClientUser = () => {
    return userRole === "client";
  };

  return {
    userRole,
    permissions,
    hasWorkspaceAccess,
    hasFeatureAccess,
    getAccessibleWorkspaces,
    isInternalUser,
    isClientUser,
    isAuthenticated,
    user
  };
}

function determineUserRole(user: any): UserRole {
  // Mock role determination based on user data
  // In a real implementation, this would check user.role, user.permissions, etc.
  
  if (user.email?.includes("admin@")) return "admin";
  if (user.email?.includes("manager@")) return "manager";
  if (user.email?.includes("support@")) return "customer_support";
  if (user.email?.includes("sales@")) return "sales";
  if (user.email?.includes("marketing@")) return "marketing";
  if (user.email?.includes("compliance@")) return "compliance";
  if (user.email?.includes("analyst@")) return "analyst";
  if (user.email?.includes("operations@")) return "operations";
  
  // Default to client for regular users
  return "client";
}