import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin } from "@orpc/client/plugins";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { backendJson, backendRequest, backendUpload, BackendError } from "@/integrations/backend/client";
import router from "@/integrations/orpc/router";
import { defaultResumeData, type ResumeData } from "@/schema/resume/data";
import { sampleResumeData } from "@/schema/resume/sample";
import { getLocale } from "@/utils/locale";
import { withBasePath } from "@/utils/paths";
import { generateRandomName, slugify } from "@/utils/string";

export const getORPCClient = createIsomorphicFn()
	.server((): RouterClient<typeof router> => {
		return createRouterClient(router, {
			interceptors: [
				onError((error) => {
					console.error(error);
				}),
			],
			context: async () => {
				const locale = await getLocale();
				const reqHeaders = getRequestHeaders();

				// Add a custom header to identify server-side calls
				reqHeaders.set("x-server-side-call", "true");

				return { locale, reqHeaders };
			},
		});
	})
	.client((): RouterClient<typeof router> => {
		const basePathRaw = import.meta.env.VITE_APP_BASE_PATH ?? "/";
		const basepath = basePathRaw === "/" ? "/" : `/${basePathRaw.replace(/^\/|\/$/g, "")}/`;
		const apiBase = new URL(basepath, window.location.origin);
		const rpcUrl = new URL("api/rpc", apiBase).toString();

		const link = new RPCLink({
			url: rpcUrl,
			fetch: (request, init) => {
				const token = localStorage.getItem("accessToken");
				const headers = new Headers(init?.headers ?? {});
				if (token) {
					headers.set("Authorization", `Bearer ${token}`);
				}
				return fetch(request, { ...init, credentials: "include", headers });
			},
			interceptors: [
				onError((error) => {
					if (error instanceof DOMException) return;
					console.error(error);
				}),
			],
			plugins: [new BatchLinkPlugin({ groups: [{ condition: () => true, context: {} }] })],
		});

		return createORPCClient(link);
	});

export const client = getORPCClient();

type ResumeListItem = {
	id: string;
	name: string;
	slug: string;
	tags: string[];
	isPublic: boolean;
	isLocked: boolean;
	createdAt: string;
	updatedAt: string;
};

type ResumeDetail = {
	id: string;
	userId?: string;
	name: string;
	slug: string;
	tags: string[];
	data: ResumeData;
	isPublic: boolean;
	isLocked: boolean;
	hasPassword: boolean;
};

type ResumeStats = {
	isPublic: boolean | null;
	views: number;
	downloads: number;
	lastViewedAt: Date | null;
	lastDownloadedAt: Date | null;
};

const queryOptions = <TQueryKey extends readonly unknown[], TData>(queryKey: TQueryKey, queryFn: () => Promise<TData>) => ({
	queryKey,
	queryFn,
});

const mutationOptions = <TInput, TData>(
	mutationFn: (input: TInput, options?: { signal?: AbortSignal }) => Promise<TData>,
	options?: { meta?: Record<string, unknown> },
) => ({
	mutationFn: (input: TInput) => mutationFn(input),
	...options,
});

const mapStats = (data: {
	isPublic?: boolean | null;
	views: number;
	downloads: number;
	lastViewedAt?: string | null;
	lastDownloadedAt?: string | null;
}): ResumeStats => ({
	isPublic: data.isPublic ?? null,
	views: data.views ?? 0,
	downloads: data.downloads ?? 0,
	lastViewedAt: data.lastViewedAt ? new Date(data.lastViewedAt) : null,
	lastDownloadedAt: data.lastDownloadedAt ? new Date(data.lastDownloadedAt) : null,
});

const unwrap = <T>(response: { data?: T } | T): T => {
	if (response && typeof response === "object" && "data" in response) {
		return (response as { data?: T }).data as T;
	}
	return response as T;
};

const get = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
	const response = await backendRequest<{ data: T }>(path, { method: "GET", signal });
	return unwrap(response);
};

const post = async <T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> => {
	const response = await backendJson<{ data: T }>(path, {
		method: "POST",
		body: body ? JSON.stringify(body) : undefined,
		signal,
	});
	return unwrap(response);
};

const put = async <T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> => {
	const response = await backendJson<{ data: T }>(path, {
		method: "PUT",
		body: body ? JSON.stringify(body) : undefined,
		signal,
	});
	return unwrap(response);
};

const del = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
	const response = await backendRequest<{ data: T }>(path, { method: "DELETE", signal });
	return unwrap(response);
};

const fetchPublicCounts = async () =>
	get<{ users: number; resumes: number }>("/api/public-stats/counts");

const resolveUpload = async (url: string) => {
	const params = new URLSearchParams({ path: url });
	return get<{ id: string; url: string }>(`/api/uploads/resolve?${params.toString()}`);
};

const localJson = async <T>(path: string, body?: unknown): Promise<T> => {
	const headers = new Headers({ "Content-Type": "application/json" });
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("accessToken");
		if (token) headers.set("authorization", `Bearer ${token}`);
	}

	const response = await fetch(withBasePath(path), {
		method: "POST",
		headers,
		credentials: "include",
		body: body ? JSON.stringify(body) : undefined,
	});

	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		const message = payload?.message ?? "Request failed";
		throw new BackendError(message, "BAD_REQUEST", response.status);
	}

	return payload as T;
};

export const orpc = {
	resume: {
		tags: {
			list: {
				queryOptions: () => queryOptions(["resume", "tags"], async () => get<string[]>("/api/resumes/tags")),
			},
		},
		statistics: {
			getById: {
				queryOptions: ({ input }: { input: { id: string } }) =>
					queryOptions(["resume", "stats", input.id], async () =>
						mapStats(
							await get<{
								isPublic?: boolean | null;
								views: number;
								downloads: number;
								lastViewedAt?: string | null;
								lastDownloadedAt?: string | null;
							}>(`/api/resumes/${input.id}/stats`),
						),
					),
				},
		},
		list: {
			queryOptions: ({ input }: { input: { tags?: string[]; sort?: "lastUpdatedAt" | "createdAt" | "name" } }) => {
				const params = new URLSearchParams();
				if (input?.tags?.length) params.set("tags", input.tags.join(","));
				if (input?.sort) params.set("sort", input.sort);
				const query = params.toString();
				return queryOptions(["resume", "list", input], async () =>
					get<ResumeListItem[]>(`/api/resumes${query ? `?${query}` : ""}`),
				);
			},
		},
		getById: {
			queryOptions: ({ input }: { input: { id: string } }) =>
				queryOptions(["resume", "getById", input.id], async () => get<ResumeDetail>(`/api/resumes/${input.id}`)),
		},
		getPublicById: {
			queryOptions: ({ input }: { input: { id: string } }) =>
				queryOptions(["resume", "getPublicById", input.id], async () =>
					get<ResumeDetail>(`/api/resumes/public/${input.id}`),
				),
		},
		create: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id?: string; name: string; slug: string; tags: string[]; withSampleData?: boolean }) => {
						const data = input.withSampleData ? sampleResumeData : defaultResumeData;
						return post<{ id: string }>("/api/resumes", {
							name: input.name,
							slug: input.slug,
							tags: input.tags,
							data,
						});
					},
					options,
				),
		},
		import: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { data: ResumeData }) => {
						const name = generateRandomName();
						const slug = slugify(name);
						return post<{ id: string }>("/api/resumes", { name, slug, tags: [], data: input.data });
					},
					options,
				),
		},
		update: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: {
						id: string;
						name?: string;
						slug?: string;
						tags?: string[];
						data?: ResumeData;
						isPublic?: boolean;
					}) => {
						await put<void>(`/api/resumes/${input.id}`, {
							name: input.name,
							slug: input.slug,
							tags: input.tags,
							data: input.data,
							isPublic: input.isPublic,
						});
					},
					options,
				),
			call: (input: { id: string; data?: ResumeData }, options?: { signal?: AbortSignal }) =>
				put<void>(`/api/resumes/${input.id}`, { data: input.data }, options?.signal),
		},
		duplicate: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string; name?: string; slug?: string; tags?: string[] }) =>
						post<{ id: string }>(`/api/resumes/${input.id}/duplicate`, {
							name: input.name,
							slug: input.slug,
							tags: input.tags,
						}),
					options,
				),
		},
		setLocked: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string; isLocked: boolean }) => {
						await post<void>(`/api/resumes/${input.id}/lock`, { isLocked: input.isLocked });
					},
					options,
				),
		},
		setPassword: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string; password: string }) => {
						await post<void>(`/api/resumes/${input.id}/password`, { password: input.password });
					},
					options,
				),
		},
		removePassword: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string }) => {
						await del<void>(`/api/resumes/${input.id}/password`);
					},
					options,
				),
		},
		delete: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string }) => {
						await del<void>(`/api/resumes/${input.id}`);
					},
					options,
				),
		},
	},
	storage: {
		uploadFile: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (file: File) => {
						const formData = new FormData();
						formData.append("file", file);
						const response = await backendUpload<{ data: { url: string; id: string } }>(
							"/api/uploads?context=avatar",
							formData,
						);
						const data = unwrap(response);
						const baseUrl = new URL("/", import.meta.env.VITE_API_BASE_URL ?? window.location.origin);
						const url = data.url.startsWith("http") ? data.url : new URL(data.url, baseUrl).toString();
						return { url, id: data.id };
					},
					options,
				),
		},
		deleteFile: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { url: string }) => {
						const resolved = await resolveUpload(input.url);
						await backendRequest<void>(`/api/uploads/${resolved.id}`, { method: "DELETE" });
					},
					options,
				),
		},
	},
	auth: {
		verifyResumePassword: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string; password: string }) => {
						await post<void>(`/api/resumes/public/${input.id}/verify-password`, { password: input.password });
					},
					options,
				),
		},
	},
	printer: {
		printResumeAsPDF: {
			mutationOptions: (options?: { meta?: Record<string, unknown> }) =>
				mutationOptions(
					async (input: { id: string }) => localJson<{ url: string }>("/api/printer/pdf", { id: input.id }),
					options,
				),
		},
		getResumeScreenshot: {
			queryOptions: ({ input }: { input: { id: string } }) =>
				queryOptions(["printer", "screenshot", input.id], async () =>
					localJson<{ url: string }>("/api/printer/screenshot", { id: input.id }),
				),
		},
	},
	statistics: {
		user: {
			getCount: {
				queryOptions: () => queryOptions(["statistics", "user", "count"], async () => (await fetchPublicCounts()).users),
			},
		},
		resume: {
			getCount: {
				queryOptions: () => queryOptions(["statistics", "resume", "count"], async () => (await fetchPublicCounts()).resumes),
			},
		},
	},
};

export type RouterInput = {
	resume: {
		create: { name: string; slug: string; tags: string[]; withSampleData?: boolean };
		import: { data: ResumeData };
		update: { id: string; name?: string; slug?: string; tags?: string[]; data?: ResumeData; isPublic?: boolean };
		duplicate: { id: string; name?: string; slug?: string; tags?: string[] };
		setLocked: { id: string; isLocked: boolean };
		setPassword: { id: string; password: string };
		removePassword: { id: string };
		delete: { id: string };
	};
};

export type RouterOutput = {
	resume: {
		list: ResumeListItem[];
		getById: ResumeDetail;
		getPublicById: ResumeDetail;
		tags: { list: string[] };
		statistics: { getById: ResumeStats };
	};
	printer: {
		printResumeAsPDF: { url: string };
		getResumeScreenshot: { url: string };
	};
};

export { BackendError };
