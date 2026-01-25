/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string;

declare module "*.css";
declare module "@fontsource/*" {}
declare module "@fontsource-variable/*" {}

interface ImportMetaEnv {
	readonly VITE_APP_BASE_PATH?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
	interface ProcessEnv {
		// Basics
		PORT: string;
		APP_URL: string;
		PRINTER_APP_URL?: string;

		// Authentication
		AUTH_SECRET: string;

		// Printer
		PRINTER_ENDPOINT?: string;

		// Storage (Optional)
		S3_ACCESS_KEY_ID?: string;
		S3_SECRET_ACCESS_KEY?: string;
		S3_REGION?: string;
		S3_ENDPOINT?: string;
		S3_BUCKET?: string;
		S3_FORCE_PATH_STYLE?: string | boolean;

		// Feature Flags
		FLAG_DEBUG_PRINTER: string | boolean;
		FLAG_DISABLE_SIGNUPS: string | boolean;
		FLAG_DISABLE_EMAIL_AUTH: string | boolean;
	}
}
