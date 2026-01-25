import { ORPCError } from "@orpc/client";
import type { AuthProvider } from "@/integrations/auth/types";
import { env } from "@/utils/env";

export type ProviderList = Partial<Record<AuthProvider, string>>;

const providers = {
	list: (): ProviderList => {
		const list: ProviderList = { credential: "Password" };
		if (env.API_BASE_URL || process.env.VITE_API_BASE_URL) {
			list.google = "Google";
			list.facebook = "Facebook";
			list.linkedin = "LinkedIn";
		}
		return list;
	},
};

export const authService = {
	providers,

	verifyResumePassword: async (input: { id: string; password: string }): Promise<boolean> => {
		const baseUrl = env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:4000";
		const response = await fetch(`${baseUrl}/api/resumes/public/${input.id}/verify-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password: input.password }),
		});

		if (!response.ok) {
			if (response.status === 401) throw new ORPCError("INVALID_PASSWORD");
			if (response.status === 404) throw new ORPCError("NOT_FOUND");
			throw new ORPCError("INTERNAL_SERVER_ERROR");
		}

		return true;
	},

	deleteAccount: async (): Promise<void> => {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Account deletion is managed by the primary backend.",
		});
	},
};
