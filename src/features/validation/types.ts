export type ValidationType = 
  | "VALID" 
  | "INVALID_SYNTAX" 
  | "INVALID_DOMAIN" 
  | "DISPOSABLE_EMAIL" 
  | "ROLE_EMAIL" 
  | "PUBLIC_EMAIL" 
  | "TYPO" 
  | "CUSTOM_BLOCKLIST";

export interface ValidationResponse {
  valid: boolean;
  type: ValidationType;
  suggestion: string | null;
  role?: string;
  featureAvailable?: boolean;
}

export interface ValidationOptions {
  checkRole: boolean;
  checkPublic: boolean;
  checkCustomBlocklist?: boolean;
  userId?: string;
  websiteId?: string;
  allowRoleOverrides?: boolean;
  allowCustomRoles?: boolean;
  allowWebsiteLevelRoles?: boolean;
}
