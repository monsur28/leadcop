import { z } from "zod";

const domainRegex = /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,10}$/;

const normalizeDomain = (val: string) => {
  // Remove protocol
  let normalized = val.replace(/^https?:\/\//i, "");
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, "");
  // Remove paths/query strings if any
  normalized = normalized.split("/")[0].split("?")[0];
  // To lowercase
  return normalized.toLowerCase();
};

export const createDomainSchema = z.object({
  hostname: z.string()
    .min(1, "Hostname is required")
    .transform(normalizeDomain)
    .refine((val) => domainRegex.test(val), {
      message: "Invalid domain format",
    }),
});

export const updateDomainSchema = z.object({
  domainId: z.string().uuid("Invalid domain ID"),
  hostname: z.string()
    .min(1, "Hostname is required")
    .transform(normalizeDomain)
    .refine((val) => domainRegex.test(val), {
      message: "Invalid domain format",
    }),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
