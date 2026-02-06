export type BackendErrorCode =
	| "NEED_PASSWORD"
	| "INVALID_PASSWORD"
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "CONFLICT"
	| "RESUME_SLUG_ALREADY_EXISTS"
	| "BAD_REQUEST"
	| "INTERNAL_SERVER_ERROR";

export class BackendError extends Error {
	code: BackendErrorCode;
	status: number;

	constructor(message: string, code: BackendErrorCode, status: number) {
		super(message);
		this.name = "BackendError";
		this.code = code;
		this.status = status;
	}
}

const getBackendBaseUrl = () => import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const mergeHeaders = (base: HeadersInit | undefined, extra: HeadersInit | undefined) => {
	const headers = new Headers(base ?? {});
	if (extra) {
		new Headers(extra).forEach((value, key) => headers.set(key, value));
	}
	return headers;
};

async function getAuthHeaders(): Promise<HeadersInit> {
	const headers = new Headers();

	if (typeof window === "undefined") {
		const module = await import("@tanstack/react-start/server");
		const requestHeaders = module.getRequestHeaders();
		const cookie = requestHeaders.get("cookie");
		const authorization = requestHeaders.get("authorization");

		if (cookie) headers.set("cookie", cookie);
		if (authorization) headers.set("authorization", authorization);
		return headers;
	}

	const token = localStorage.getItem("accessToken");
	if (token) headers.set("authorization", `Bearer ${token}`);

	return headers;
}

const normalizeBackendMessage = (message: string | undefined): { message: string; code: BackendErrorCode } => {
	if (!message) return { message: "Request failed", code: "INTERNAL_SERVER_ERROR" };

	const lower = message.toLowerCase();
	if (lower.includes("password required")) return { message, code: "NEED_PASSWORD" };
	if (lower.includes("invalid password")) return { message, code: "INVALID_PASSWORD" };
	if (lower.includes("slug")) return { message: "RESUME_SLUG_ALREADY_EXISTS", code: "RESUME_SLUG_ALREADY_EXISTS" };

	return { message, code: "BAD_REQUEST" };
};

const mapStatusToCode = (status: number, message: string | undefined): BackendErrorCode => {
	if (status === 401) return "UNAUTHORIZED";
	if (status === 404) return "NOT_FOUND";
	if (status === 409) return "CONFLICT";
	if (status >= 500) return "INTERNAL_SERVER_ERROR";
	return normalizeBackendMessage(message).code;
};

const buildBackendUrl = (path: string): string => {
	const baseUrl = getBackendBaseUrl();
	return new URL(path, baseUrl).toString();
};

export async function backendRequest<T>(
	path: string,
	init: RequestInit & { parseJson?: boolean } = {},
): Promise<T> {
	const url = buildBackendUrl(path);
	const authHeaders = await getAuthHeaders();
	const headers = mergeHeaders(authHeaders, init.headers);

	const response = await fetch(url, {
		...init,
		headers,
		credentials: "include",
	});

	const contentType = response.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const payload = isJson ? await response.json().catch(() => null) : null;

	if (!response.ok) {
		const rawMessage = payload?.message ?? response.statusText;
		const normalized = normalizeBackendMessage(rawMessage);
		const code = mapStatusToCode(response.status, rawMessage);
		const finalCode = normalized.code !== "BAD_REQUEST" ? normalized.code : code;
		const finalMessage = normalized.code !== "BAD_REQUEST" ? normalized.message : rawMessage;
		throw new BackendError(finalMessage, finalCode, response.status);
	}

	if (init.parseJson === false) {
		return payload as T;
	}

	return payload as T;
}

export async function backendJson<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = mergeHeaders({ "Content-Type": "application/json" }, init.headers);
	return backendRequest<T>(path, { ...init, headers });
}

export async function backendUpload<T>(path: string, formData: FormData, init: RequestInit = {}): Promise<T> {
	return backendRequest<T>(path, { ...init, method: "POST", body: formData });
}

export const backendBaseUrl = getBackendBaseUrl;
