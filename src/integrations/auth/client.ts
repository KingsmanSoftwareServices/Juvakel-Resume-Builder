import { useQuery } from "@tanstack/react-query";
import { BackendApi } from "@/integrations/backend/api";
import type { AuthSession } from "./types";

type AuthError = { message: string };
type AuthResult<T> = Promise<{ data?: T; error?: AuthError }>;

const unsupported = async (): AuthResult<never> => ({
	error: { message: "Not supported in the unified backend auth flow." },
});

const getSession = async (): AuthResult<AuthSession> => {
	try {
		const response = await BackendApi.get<{ success: boolean; data?: AuthSession }>(
			"/api/auth/profile",
		);
		if (response.success && response.data) {
			return { data: response.data };
		}
		return { error: { message: "Unable to fetch session" } };
	} catch (error: any) {
		return { error: { message: error?.message ?? "Unable to fetch session" } };
	}
};

const storeAccessToken = (accessToken?: string) => {
	if (!accessToken || typeof window === "undefined") return;
	localStorage.setItem("accessToken", accessToken);
};

const clearAuthStorage = () => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("accessToken");
	localStorage.removeItem("pendingEmail");
};

const signInEmail = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}): AuthResult<{ requires2FA?: boolean; requiresEmailVerification?: boolean }> => {
	try {
		const response = await BackendApi.post<{
			success: boolean;
			data?: {
				requires2FA?: boolean;
				requiresEmailVerification?: boolean;
				accessToken?: string;
			};
		}>("/api/auth/login", { email, password });

		const data = response.data ?? {};
		if (data.requires2FA) {
			if (typeof window !== "undefined") {
				localStorage.setItem("pendingEmail", email);
			}
			return { data: { requires2FA: true } };
		}

		if (data.requiresEmailVerification) {
			return { data: { requiresEmailVerification: true } };
		}

		storeAccessToken(data.accessToken);
		return { data };
	} catch (error: any) {
		return { error: { message: error?.message ?? "Login failed" } };
	}
};

const verifyTwoFactor = async ({ code }: { code: string }): AuthResult<void> => {
	try {
		const email =
			typeof window !== "undefined" ? localStorage.getItem("pendingEmail") : null;
		if (!email) {
			return { error: { message: "Missing pending login email." } };
		}

		const response = await BackendApi.post<{
			success: boolean;
			data?: { accessToken?: string };
		}>("/api/auth/verify-login", { email, code });

		storeAccessToken(response.data?.accessToken);
		return {};
	} catch (error: any) {
		return { error: { message: error?.message ?? "Verification failed" } };
	}
};

export const authClient = {
	useSession: () =>
		useQuery({
			queryKey: ["auth", "session"],
			queryFn: async () => {
				const { data } = await getSession();
				return data ?? null;
			},
			staleTime: 60_000,
		}),
	getSession,
	signIn: {
		email: signInEmail,
		username: unsupported,
		passkey: unsupported,
		social: unsupported,
		oauth2: unsupported,
	},
	signUp: {
		email: async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}): AuthResult<void> => {
			try {
				await BackendApi.post("/api/auth/register", {
					email,
					password,
					role: "candidate",
				});
				return {};
			} catch (error: any) {
				return { error: { message: error?.message ?? "Registration failed" } };
			}
		},
	},
	signOut: async (): AuthResult<void> => {
		try {
			await BackendApi.post("/api/auth/logout");
		} catch {
			// ignore
		}
		clearAuthStorage();
		return {};
	},
	requestPasswordReset: async ({ email }: { email: string }): AuthResult<void> => {
		try {
			await BackendApi.post("/api/auth/forgot-password", { email });
			return {};
		} catch (error: any) {
			return { error: { message: error?.message ?? "Password reset failed" } };
		}
	},
	resetPassword: async ({
		token,
		newPassword,
	}: {
		token: string;
		newPassword: string;
	}): AuthResult<void> => {
		try {
			await BackendApi.post("/api/auth/reset-password", { token, password: newPassword });
			return {};
		} catch (error: any) {
			return { error: { message: error?.message ?? "Reset failed" } };
		}
	},
	changePassword: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
		BackendApi.post("/api/auth/change-password", {
			currentPassword,
			newPassword,
		})
			.then(() => ({}))
			.catch((error: any) => ({ error: { message: error?.message ?? "Change password failed" } })),
	twoFactor: {
		enable: unsupported,
		verifyTotp: verifyTwoFactor,
		disable: unsupported,
		verifyBackupCode: unsupported,
	},
	resendOtp: async ({ email }: { email: string }): AuthResult<void> => {
		try {
			await BackendApi.post("/api/auth/resend-otp", { email });
			return {};
		} catch (error: any) {
			return { error: { message: error?.message ?? "Failed to resend code" } };
		}
	},
	apiKey: {
		create: unsupported,
		list: unsupported,
		delete: unsupported,
	},
	passkey: {
		listUserPasskeys: unsupported,
		addPasskey: unsupported,
		deletePasskey: unsupported,
	},
	updateUser: unsupported,
	changeEmail: unsupported,
	sendVerificationEmail: unsupported,
	listAccounts: unsupported,
	linkSocial: unsupported,
	unlinkAccount: unsupported,
};
