/**
 * Authentication validation schemas
 * Centralized Zod schemas for authentication-related forms and API requests
 */

import { z } from "zod";

/**
 * User login schema
 * Used for both client-side form validation and server-side API validation
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** API body alias for POST /api/auth/login */
export const loginBodySchema = loginSchema;

/**
 * User login form data type
 */
export type LoginFormData = z.infer<typeof loginSchema>;
