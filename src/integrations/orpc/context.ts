import { ORPCError, os } from "@orpc/server";
import type { AuthSession } from "@/integrations/auth/types";
import { env } from "@/utils/env";
import type { Locale } from "@/utils/locale";

interface ORPCContext {
	locale: Locale;
	reqHeaders?: Headers;
}

async function getUserFromHeaders(headers: Headers): Promise<AuthSession | null> {
	try {
		const baseUrl = env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:4000";
		const authHeader = headers.get("authorization");
		const cookieHeader = headers.get("cookie");

		const fetchHeaders = new Headers();
		if (authHeader) fetchHeaders.set("authorization", authHeader);
		if (cookieHeader) fetchHeaders.set("cookie", cookieHeader);

		if (fetchHeaders.entries().next().done) return null;

		const response = await fetch(`${baseUrl}/api/auth/profile`, {
			headers: fetchHeaders,
		});

		if (!response.ok) return null;
		const data = (await response.json()) as { data?: AuthSession };
		return data.data ?? null;
	} catch {
		return null;
	}
}

const base = os.$context<ORPCContext>();

export const publicProcedure = base.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();
	const user = await getUserFromHeaders(headers);

	return next({
		context: {
			...context,
			user: user ?? null,
		},
	});
});

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
	if (!context.user) throw new ORPCError("UNAUTHORIZED");

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});

/**
 * Server-only procedure that can only be called from server-side code (e.g., loaders).
 * Rejects requests from the browser with a 401 UNAUTHORIZED error.
 */
export const serverOnlyProcedure = publicProcedure.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();

	// Check for the custom header that indicates this is a server-side call
	// Server-side calls using createRouterClient have this header set
	const isServerSideCall = env.FLAG_DEBUG_PRINTER || headers.get("x-server-side-call") === "true";

	// If the header is not present, this is a client-side HTTP request - reject it
	if (!isServerSideCall) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "This endpoint can only be called from server-side code",
		});
	}

	return next({ context });
});
