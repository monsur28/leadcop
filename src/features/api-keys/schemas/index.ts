import { z } from "zod";

export const createApiKeySchema = z.object({
  domainId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PUBLIC", "SECRET"]),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
