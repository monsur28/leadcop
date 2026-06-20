import { ValidationMessageType } from "@prisma/client";

export const DEFAULT_VALIDATION_MESSAGES: Record<ValidationMessageType, string> = {
  DISPOSABLE_EMAIL: "Disposable emails are not allowed.",
  ROLE_EMAIL: "Please use a personal email address.",
  PUBLIC_EMAIL: "Please use your business email address.",
  INVALID_DOMAIN: "The domain ending is invalid.",
  QUOTA_EXCEEDED: "Validation quota exceeded.",
  RATE_LIMITED: "Rate limit exceeded. Please try again.",
  SERVICE_OFFLINE: "Validation service unavailable.",
  UNAUTHORIZED_DOMAIN: "Forbidden: Origin does not match authorized API Key domain",
  INVALID_API_KEY: "Unauthorized: Invalid or inactive API Key",
  API_KEY_REVOKED: "Unauthorized: API Key has been revoked.",
  ACCOUNT_SUSPENDED: "Forbidden: Account is suspended",
  SUBSCRIPTION_EXPIRED: "Payment Required: Active subscription required",
  DOMAIN_LIMIT_REACHED: "Domain limit reached.",
  API_KEY_LIMIT_REACHED: "API key limit reached.",
  TYPO: "Did you mean %s?",
  INVALID_SYNTAX: "Please enter a valid email address.",
};
