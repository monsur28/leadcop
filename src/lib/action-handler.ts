import { z } from "zod";
import { AppError } from "./errors";
import { ActionResponse } from "@/types";

/**
 * A wrapper foundation for Next.js Server Actions.
 * Handles Zod validation, generic error catching, and standardizes the response object.
 */
export async function withActionHandler<TOutput, TResponse>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  input: unknown,
  handler: (validatedData: TOutput) => Promise<TResponse>
): Promise<ActionResponse<TResponse>> {
  try {
    const parsed = schema.safeParse(input);
    
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data = await handler(parsed.data);
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    
    console.error("[Action Error]:", error);
    return { success: false, error: "An unexpected internal error occurred." };
  }
}
