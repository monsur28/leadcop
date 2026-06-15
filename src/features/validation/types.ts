export type ValidationType = 
  | "VALID" 
  | "INVALID_SYNTAX" 
  | "INVALID_TLD" 
  | "DISPOSABLE" 
  | "ROLE" 
  | "PUBLIC" 
  | "TYPO" 
  | "CUSTOM_BLOCKLIST";

export interface ValidationResponse {
  valid: boolean;
  type: ValidationType;
  suggestion: string | null;
}

export interface ValidationOptions {
  checkRole: boolean;
  checkPublic: boolean;
  checkCustomBlocklist?: boolean;
}
