// Resource types
export type ResourceType =
  // Medical data resources
  | "medicalRecord"
  | "prescription"
  | "appointment"
  | "diagnosis"
  | "insurance"
  // System resources
  | "chat"
  | "ragQuery"
  | "aiResponse"
  | "auditLog"
  | "notification";

// Action types for resources
export type ActionType = "view" | "create" | "update" | "delete" | "share" | "search" | "mask";

// Role types
export type RoleType =
  // Environment-level roles
  | "admin"
  | "doctor"
  | "patient"
  | "researcher"
  // Resource-level roles
  | "owner"
  | "viewer"
  | "editor"
  | "scheduler"
  | "participant";

// Relationship types
export type RelationType = "owner" | "treating_physician" | "parent" | "appointment";

// User attribute types
export interface UserAttributes {
  department?: string;
  role?: string;
  clearance?: number;
  specialization?: string;
  isBlocked?: boolean;
}

// Resource attribute types
export interface ResourceAttributes {
  patientId?: string;
  sensitivity?: "Normal" | "Sensitive" | "Restricted";
  department?: string;
  condition?: string;
  status?: string;
}

// Permit policy configuration
export interface PolicyConfig {
  resources: ResourceConfig[];
  roles: RoleConfig[];
  conditionSets: ConditionSetConfig[];
}

export interface ResourceConfig {
  key: string;
  name: string;
  actions: Record<string, { name: string }>;
  relations?: Record<string, string>;
}

export interface RoleConfig {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface ConditionSetConfig {
  key: string;
  name: string;
  conditions: {
    allOf: Array<{
      user?: Record<string, Record<string, any>>;
      resource?: Record<string, Record<string, any>>;
    }>;
  };
}
