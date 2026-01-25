import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/ibm-plex-sans";
import "@phosphor-icons/web/regular/style.css";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { IconContext } from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { CommandPalette } from "@/components/command-palette";
import { BreakpointIndicator } from "@/components/layout/breakpoint-indicator";
import { ThemeProvider } from "@/components/theme/provider";
import { Toaster } from "@/components/ui/sonner";
import { DialogManager } from "@/dialogs/manager";
import { ConfirmDialogProvider } from "@/hooks/use-confirm";
import { PromptDialogProvider } from "@/hooks/use-prompt";
import { getSession } from "@/integrations/auth/functions";
import type { AuthSession } from "@/integrations/auth/types";
import { client, type orpc } from "@/integrations/orpc/client";
import type { FeatureFlags } from "@/integrations/orpc/services/flags";
import { getLocale, isRTL, type Locale, loadLocale } from "@/utils/locale";
import { getTheme, type Theme } from "@/utils/theme";
import appCss from "../styles/globals.css?url";

type RouterContext = {
	theme: Theme;
	locale: Locale;
	orpc: typeof orpc;
	queryClient: QueryClient;
	session: AuthSession | null;
	flags: FeatureFlags;
};

const appName = "Juvakel Resume Builder";
const tagline = "Build, customize, and share resumes in minutes";
const title = `${appName} - ${tagline}`;
const description = "Juvakel Resume Builder helps you create, customize, and share professional resumes in minutes.";

await loadLocale(await getLocale());

export const Route = createRootRouteWithContext<RouterContext>()({
	shellComponent: RootDocument,
	head: () => {
		const appUrl = process.env.APP_URL ?? "https://portal.juvakelteam.co.zw";
		const assetUrl = (path: string) => new URL(path, appUrl).toString();

		return {
			links: [
				{ rel: "stylesheet", href: appCss },
				// Icons
				{ rel: "icon", href: assetUrl("/favicon.ico"), type: "image/x-icon", sizes: "48x48" },
				{
					rel: "apple-touch-icon",
					href: assetUrl("/apple-touch-icon-180x180.png"),
					type: "image/png",
					sizes: "180x180",
				},
			],
			meta: [
				{ title },
				{ charSet: "UTF-8" },
				{ name: "description", content: description },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				// Twitter Tags
				{ property: "twitter:image", content: `${appUrl}/opengraph/banner.png` },
				{ property: "twitter:card", content: "summary_large_image" },
				{ property: "twitter:title", content: title },
				{ property: "twitter:description", content: description },
				// OpenGraph Tags
				{ property: "og:image", content: `${appUrl}/opengraph/banner.png` },
				{ property: "og:site_name", content: appName },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:url", content: appUrl },
			],
		};
	},
	beforeLoad: async () => {
		const [theme, locale] = await Promise.all([getTheme(), getLocale()]);
		let session: AuthSession | null = null;
		let flags: FeatureFlags = { disableSignups: false, disableEmailAuth: false };

		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			const accessToken = url.searchParams.get("accessToken");
			if (accessToken) {
				localStorage.setItem("accessToken", accessToken);
				url.searchParams.delete("accessToken");
				window.history.replaceState({}, "", url.toString());
			}
		}

		try {
			session = await getSession();
		} catch {
			session = null;
		}

		try {
			flags = await client.flags.get();
		} catch {
			flags = { disableSignups: false, disableEmailAuth: false };
		}

		return { theme, locale, session, flags };
	},
});

type Props = {
	children: React.ReactNode;
};

function RootDocument({ children }: Props) {
	const { theme, locale } = Route.useRouteContext();
	const dir = isRTL(locale) ? "rtl" : "ltr";

	return (
		<html suppressHydrationWarning dir={dir} lang={locale} className={theme}>
			<head>
				<HeadContent />
			</head>

			<body>
				<MotionConfig reducedMotion="user">
					<I18nProvider i18n={i18n}>
						<IconContext.Provider value={{ size: 16, weight: "regular" }}>
							<ThemeProvider theme={theme}>
								<ConfirmDialogProvider>
									<PromptDialogProvider>
										{children}

										<DialogManager />
										<CommandPalette />
										<Toaster richColors position="bottom-right" />

										{import.meta.env.DEV && <BreakpointIndicator />}
									</PromptDialogProvider>
								</ConfirmDialogProvider>
							</ThemeProvider>
						</IconContext.Provider>
					</I18nProvider>
				</MotionConfig>

				<Scripts />
			</body>
		</html>
	);
}
