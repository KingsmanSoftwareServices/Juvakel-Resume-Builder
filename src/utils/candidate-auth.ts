type AuthMode = "login" | "register" | "forgot-password" | "verify-2fa";

export function getCandidateAuthUrl(returnTo?: string, mode: AuthMode = "login") {
	if (typeof window === "undefined") return "/auth";

	const baseUrl = import.meta.env.VITE_CANDIDATE_PORTAL_URL ?? window.location.origin;
	const url = new URL("/auth", baseUrl);

	if (mode) {
		url.searchParams.set("mode", mode);
	}

	if (returnTo) {
		url.searchParams.set("redirect", returnTo);
	}

	return url.toString();
}
