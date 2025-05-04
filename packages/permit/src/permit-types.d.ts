// Type definitions for Permit.io SDK
// These types augment the Permit.io SDK to add missing type definitions

declare module "permitio" {
  export interface PermitConfig {
    pdp: string;
    token: string;
    [key: string]: any;
  }

  export class Permit {
    constructor(config: PermitConfig);

    /**
     * The API object that contains all of the API endpoints
     */
    api: IPermitApi;

    /**
     * Checks permissions for a user against a resource
     * @param params Permission check parameters
     */
    check(params: {
      user: string;
      action: string;
      resource: string;
      context?: {
        attributes?: Record<string, any>;
        tenant?: string;
        [key: string]: any;
      };
    }): Promise<boolean>;

    /**
     * Legacy check method (overload)
     * @param user User ID
     * @param action Action to check
     * @param resource Resource to check against
     * @param tenant Optional tenant
     * @param context Optional context
     */
    check(
      user: string,
      action: string,
      resource: string,
      tenant?: string,
      context?: any,
    ): Promise<boolean>;
  }

  export interface IPermitApi {
    // Resource API
    resources: {
      get(key: string): Promise<any>;
      list(): Promise<any[]>;
      create(resource: any): Promise<any>;
      update(key: string, resource: any): Promise<any>;
      delete(key: string): Promise<void>;
    };

    // Roles API
    roles: {
      get(key: string): Promise<any>;
      list(): Promise<any[]>;
      create(role: any): Promise<any>;
      update(key: string, role: any): Promise<any>;
      delete(key: string): Promise<void>;
    };

    // Users API
    users: {
      get(key: string): Promise<any>;
      list(): Promise<any[]>;
      create(user: any): Promise<any>;
      update(key: string, user: any): Promise<any>;
      delete(key: string): Promise<void>;
    };

    // Role assignments API
    roleAssignments: {
      list(params?: { user?: string; role?: string }): Promise<any[]>;
      create(assignment: any): Promise<any>;
      delete(key: string): Promise<void>;
    };

    // Resource relations API
    resourceRelations: {
      create(relation: any): Promise<any>;
      list(): Promise<any[]>;
      delete(key: string): Promise<void>;
    };

    // Relationship tuples API (for ReBAC relationships)
    relationshipTuples: {
      create(tuple: {
        subject: { type: string; id: string };
        relation: string;
        object: { type: string; id: string };
      }): Promise<any>;
      list(params?: any): Promise<any[]>;
      delete(key: string): Promise<void>;
    };

    // Condition sets API
    conditionSets: {
      get(key: string): Promise<any>;
      list(): Promise<any[]>;
      create(conditionSet: any): Promise<any>;
      update(key: string, conditionSet: any): Promise<any>;
      delete(key: string): Promise<void>;
    };

    // Condition set rules API
    conditionSetRules: {
      create(rule: any): Promise<any>;
      list(): Promise<any[]>;
      delete(key: string): Promise<void>;
    };

    // User config API
    usersConfig: {
      setUserAttributeConfig(config: any): Promise<any>;
      getUserAttributeConfig(): Promise<any>;
    };
  }
}
