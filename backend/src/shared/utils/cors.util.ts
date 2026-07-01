import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/** Static allow-list plus optional *.vercel.app preview deployments. */
export function buildCorsOptions(): CorsOptions {
  const staticOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL !== 'false';

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (staticOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowVercelPreviews) {
        try {
          const { hostname } = new URL(origin);
          if (/\.vercel\.app$/i.test(hostname)) {
            callback(null, true);
            return;
          }
        } catch {
          /* invalid origin URL */
        }
      }

      callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
  };
}
