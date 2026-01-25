import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ErrorScreen } from "./components/layout/error-screen";
import { LoadingScreen } from "./components/layout/loading-screen";
import { NotFoundScreen } from "./components/layout/not-found-screen";
import { getSession } from "./integrations/auth/functions";
import { client, orpc } from "./integrations/orpc/client";
import { getQueryClient } from "./integrations/query/client";
import { routeTree } from "./routeTree.gen";
import { getLocale, loadLocale } from "./utils/locale";
import { getTheme } from "./utils/theme";

export const getRouter = async () => {
	const queryClient = getQueryClient();
	const basePathRaw = import.meta.env.VITE_APP_BASE_PATH ?? "/";
	const basepath =
		basePathRaw === "/"
			? "/"
			: `/${basePathRaw.replace(/^\/|\/$/g, "")}`;

	const [theme, locale] = await Promise.all([getTheme(), getLocale()]);
	let session = null;
	let flags = { disableSignups: false, disableEmailAuth: false };

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

	await loadLocale(locale);

	const router = createRouter({
		basepath,
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultViewTransition: true,
		defaultStructuralSharing: true,
		defaultErrorComponent: ErrorScreen,
		defaultPendingComponent: LoadingScreen,
		defaultNotFoundComponent: NotFoundScreen,
		context: { orpc, queryClient, theme, locale, session, flags },
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
		handleRedirects: true,
		wrapQueryClient: true,
	});

	return router;
};
