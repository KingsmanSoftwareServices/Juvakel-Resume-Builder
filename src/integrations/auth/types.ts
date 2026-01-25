export type AuthSession = {
	userId: string;
	email: string;
	role: "admin" | "company" | "candidate";
	isEmailVerified: boolean;
	is2FAEnabled: boolean;
	jti?: string;
};

export type AuthProvider = "credential" | "google" | "facebook" | "linkedin";
