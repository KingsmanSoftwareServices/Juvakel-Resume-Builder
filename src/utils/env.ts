import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	client: {
		VITE_API_BASE_URL: z.url({ protocol: /https?/ }).optional(),
		VITE_CANDIDATE_PORTAL_URL: z.url({ protocol: /https?/ }).optional(),
		VITE_APP_BASE_PATH: z.string().optional(),
	},

	server: {
		// Server
		TZ: z.string().default("Etc/UTC"),
		APP_URL: z.url({ protocol: /https?/ }),
		API_BASE_URL: z.url({ protocol: /https?/ }).optional(),
		PRINTER_APP_URL: z.url({ protocol: /https?/ }).optional(),

		// Printer
		PRINTER_ENDPOINT: z.url({ protocol: /^(wss?|https?)$/ }),

		// Database
		// Authentication (used for printer token signing)
		AUTH_SECRET: z.string().min(1),

		// Email (SMTP)
		SMTP_HOST: z.string().min(1).optional(),
		SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
		SMTP_USER: z.string().min(1).optional(),
		SMTP_PASS: z.string().min(1).optional(),
		SMTP_FROM: z.string().min(1).optional(),
		SMTP_SECURE: z.stringbool().default(false),

		// Storage (Optional)
		S3_ACCESS_KEY_ID: z.string().min(1).optional(),
		S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
		S3_REGION: z.string().default("us-east-1"),
		S3_ENDPOINT: z.url({ protocol: /https?/ }).optional(),
		S3_BUCKET: z.string().min(1).optional(),
		// Set to "true" for path-style URLs (endpoint/bucket), common with MinIO, SeaweedFS, etc.
		// Set to "false" for virtual-hosted-style URLs (bucket.endpoint), common with AWS S3, Cloudflare R2, etc.
		S3_FORCE_PATH_STYLE: z.stringbool().default(false),

		// Feature Flags
		FLAG_DEBUG_PRINTER: z.stringbool().default(false),
		FLAG_DISABLE_SIGNUPS: z.stringbool().default(false),
		FLAG_DISABLE_EMAIL_AUTH: z.stringbool().default(false),
	},
});
