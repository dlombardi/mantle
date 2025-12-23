/**
 * Shared Zod schemas for request validation.
 *
 * Use these with @hono/zod-validator to validate request bodies,
 * query params, and path params before they reach your handlers.
 */

import { z } from 'zod';

/**
 * Common pagination parameters for list endpoints.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Common ID parameter for single-resource endpoints.
 */
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Example: Repository connection request body.
 * This demonstrates a complex schema with nested validation.
 */
export const connectRepoSchema = z.object({
  owner: z.string().min(1, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  branch: z.string().default('main'),
  installationId: z.number().int().positive('Invalid installation ID'),
});

export type ConnectRepoBody = z.infer<typeof connectRepoSchema>;

/**
 * Example: Pattern update request body.
 */
export const updatePatternSchema = z.object({
  status: z.enum(['candidate', 'authoritative', 'rejected']).optional(),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdatePatternBody = z.infer<typeof updatePatternSchema>;
