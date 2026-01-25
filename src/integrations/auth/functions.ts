import { createIsomorphicFn } from "@tanstack/react-start";
import { authClient } from "./client";
import type { AuthSession } from "./types";

export const getSession = createIsomorphicFn()
	.client(async (): Promise<AuthSession | null> => {
		const { data, error } = await authClient.getSession();
		if (error) return null;
		return data ?? null;
	})
	.server(async (): Promise<AuthSession | null> => {
		// Backend auth relies on browser-stored access tokens, so server-side session is unknown.
		return null;
	});
