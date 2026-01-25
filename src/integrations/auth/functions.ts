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
		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const headers = getRequestHeaders();

		const baseUrl = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:4000";
		const authHeader = headers.get("authorization");
		const cookieHeader = headers.get("cookie");

		const fetchHeaders = new Headers();
		if (authHeader) fetchHeaders.set("authorization", authHeader);
		if (cookieHeader) fetchHeaders.set("cookie", cookieHeader);

		if (fetchHeaders.entries().next().done) return null;

		try {
			const response = await fetch(`${baseUrl}/api/auth/profile`, {
				headers: fetchHeaders,
			});

			if (!response.ok) return null;
			const data = (await response.json()) as { data?: AuthSession };
			return data.data ?? null;
		} catch {
			return null;
		}
	});
