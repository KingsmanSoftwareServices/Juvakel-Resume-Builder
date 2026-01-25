import { fileURLToPath } from "node:url";
import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const normalizeBasePath = (input: string) => {
	const trimmed = input.trim();
	if (!trimmed || trimmed === "/") return "/";
	const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const forceCssUrlModule = () => ({
	name: "force-css-url-module",
	configureServer(server) {
		server.middlewares.use((req, _res, next) => {
			if (req.url && req.url.includes(".css?url")) {
				req.headers.accept = "text/javascript";
			}
			next();
		});
	},
});

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const basePath = normalizeBasePath(env.VITE_APP_BASE_PATH ?? "/");
	const port = Number(env.PORT ?? 3000);
	const pwaBase = basePath === "/" ? "/" : basePath;

	return {
		define: {
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
		},

		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},

		optimizeDeps: {
			exclude: [
				"@tanstack/react-start",
				"@tanstack/react-start/client",
				"@tanstack/react-start/server",
				"@tanstack/start-server-core",
			],
		},

		build: {
			chunkSizeWarningLimit: 10 * 1024, // 10mb

			// Mute MODULE_LEVEL_DIRECTIVE warnings
			rolldownOptions: {
				onLog(level, log, defaultHandler) {
					if (level === "warn" && log.code === "MODULE_LEVEL_DIRECTIVE") return;
					defaultHandler(level, log);
				},
			},
		},

		base: basePath,

		server: {
			host: true,
			port,
			strictPort: true,
			allowedHosts: true,
			hmr: {
				host: "localhost",
				port,
			},
		},

		plugins: [
			forceCssUrlModule(),
			lingui(),
			tailwindcss(),
			nitro(),
			tanstackStart({ router: { semicolons: true, quoteStyle: "double" } }),
			viteReact({ babel: { plugins: [["@lingui/babel-plugin-lingui-macro"]] } }),
			VitePWA({
				outDir: "public",
				registerType: "autoUpdate",
				includeAssets: ["**/*"],
				workbox: {
					globPatterns: ["**/*"],
					clientsClaim: true,
					cleanupOutdatedCaches: true,
					maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10mb
				},
				manifest: {
					name: "Juvakel Resume Builder",
					short_name: "Juvakel Resume Builder",
					description: "Build, customize, and share professional resumes in minutes.",
					id: `${pwaBase}?source=pwa`,
					start_url: `${pwaBase}?source=pwa`,
					display: "standalone",
					orientation: "portrait",
					theme_color: "#2a1a54",
					background_color: "#ffffff",
					icons: [
						{
							src: "favicon.ico",
							sizes: "48x48",
							type: "image/x-icon",
						},
						{
							src: "pwa-64x64.png",
							sizes: "64x64",
							type: "image/png",
						},
						{
							src: "pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "any",
						},
						{
							src: "maskable-icon-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
					screenshots: [
						{
							src: "screenshots/web/1-landing-page.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "wide",
							label: "Landing Page",
						},
						{
							src: "screenshots/web/2-resumes-dashboard.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "wide",
							label: "Resumes Dashboard",
						},
						{
							src: "screenshots/web/3-builder-page.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "wide",
							label: "Builder Page",
						},
						{
							src: "screenshots/web/4-template-selector.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "wide",
							label: "Template Selector",
						},
						{
							src: "screenshots/mobile/1-landing-page.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "narrow",
							label: "Landing Page",
						},
						{
							src: "screenshots/mobile/2-resumes-dashboard.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "narrow",
							label: "Resumes Dashboard",
						},
						{
							src: "screenshots/mobile/3-builder-page.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "narrow",
							label: "Builder Page",
						},
						{
							src: "screenshots/mobile/4-template-selector.webp",
							sizes: "any",
							type: "image/webp",
							form_factor: "narrow",
							label: "Template Selector",
						},
					],
					categories: [
						"builder",
						"business",
						"career",
						"cv",
						"editor",
						"job-search",
						"productivity",
						"resume",
						"templates",
					],
				},
			}),
		],
	};
});

export default config;
