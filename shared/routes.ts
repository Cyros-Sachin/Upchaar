import { z } from 'zod';
import { insertUserSchema, insertPlanSchema, insertMealSchema, users, plans, meals } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/me' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  plans: {
    generate: {
      method: 'POST' as const,
      path: '/api/plans/generate' as const,
      responses: {
        201: z.custom<typeof plans.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      }
    },
    latest: {
      method: 'GET' as const,
      path: '/api/plans/latest' as const,
      responses: {
        200: z.custom<typeof plans.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  meals: {
    list: {
      method: 'GET' as const,
      path: '/api/meals' as const,
      responses: {
        200: z.array(z.custom<typeof meals.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/meals' as const,
      input: insertMealSchema,
      responses: {
        201: z.custom<typeof meals.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/meals/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
