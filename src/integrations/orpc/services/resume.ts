import type { ResumeData } from "@/schema/resume/data";
import { env } from "@/utils/env";

const getBackendUrl = () => env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const buildHeaders = (headers?: Headers) => {
	const authHeader = headers?.get("authorization");
	const built: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (authHeader) built.Authorization = authHeader;
	return built;
};

const backendFetch = async <T>(path: string, options: RequestInit = {}, headers?: Headers): Promise<T> => {
	const response = await fetch(`${getBackendUrl()}${path}`, {
		...options,
		headers: { ...buildHeaders(headers), ...(options.headers ?? {}) },
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		const message = data?.message ?? "Request failed";
		throw new Error(message);
	}

	return (await response.json()) as T;
};

const tags = {
	list: async (input: { reqHeaders?: Headers }) => {
		const response = await backendFetch<{ data: string[] }>("/api/resumes/tags", {}, input.reqHeaders);
		return response.data ?? [];
	},
};

const statistics = {
	getById: async (input: { id: string; reqHeaders?: Headers }) => {
		const response = await backendFetch<{
			data: {
				isPublic?: boolean;
				views: number;
				downloads: number;
				lastViewedAt: string | null;
				lastDownloadedAt: string | null;
			};
		}>(`/api/resumes/${input.id}/stats`, {}, input.reqHeaders);

		return {
			isPublic: response.data.isPublic ?? false,
			views: response.data.views ?? 0,
			downloads: response.data.downloads ?? 0,
			lastViewedAt: response.data.lastViewedAt ? new Date(response.data.lastViewedAt) : null,
			lastDownloadedAt: response.data.lastDownloadedAt ? new Date(response.data.lastDownloadedAt) : null,
		};
	},

	increment: async (input: { id: string; views?: boolean; downloads?: boolean }) => {
		await backendFetch(
			`/api/resumes/public/${input.id}/stats`,
			{
				method: "POST",
				body: JSON.stringify({ views: Boolean(input.views), downloads: Boolean(input.downloads) }),
			},
			undefined,
		);
	},
};

export const resumeService = {
	tags,
	statistics,

	list: async (input: { tags: string[]; sort: "lastUpdatedAt" | "createdAt" | "name"; reqHeaders?: Headers }) => {
		const params = new URLSearchParams();
		if (input.tags.length > 0) params.set("tags", input.tags.join(","));
		params.set("sort", input.sort);
		const response = await backendFetch<{ data: any[] }>(`/api/resumes?${params.toString()}`, {}, input.reqHeaders);
		return response.data ?? [];
	},

	getById: async (input: { id: string; reqHeaders?: Headers }) => {
		const response = await backendFetch<{ data: any }>(`/api/resumes/${input.id}`, {}, input.reqHeaders);
		return response.data;
	},

	getByIdForPrinter: async (input: { id: string; reqHeaders?: Headers }) => {
		const response = await backendFetch<{ data: any }>(`/api/resumes/${input.id}`, {}, input.reqHeaders);
		return response.data;
	},

	getPublicById: async (input: { id: string }) => {
		const response = await backendFetch<{ data: any }>(`/api/resumes/public/${input.id}`);
		return response.data;
	},

	verifyPublicPassword: async (input: { id: string; password: string }) => {
		const response = await backendFetch<{ data: any }>(`/api/resumes/public/${input.id}/verify-password`, {
			method: "POST",
			body: JSON.stringify({ password: input.password }),
		});
		return response.data;
	},

	create: async (input: { name: string; slug: string; tags: string[]; data?: ResumeData; reqHeaders?: Headers }) => {
		const response = await backendFetch<{ data: { id: string } }>(
			"/api/resumes",
			{
				method: "POST",
				body: JSON.stringify({
					name: input.name,
					slug: input.slug,
					tags: input.tags,
					data: input.data,
				}),
			},
			input.reqHeaders,
		);
		return response.data.id;
	},

	update: async (input: {
		id: string;
		name?: string;
		slug?: string;
		tags?: string[];
		data?: ResumeData;
		isPublic?: boolean;
		reqHeaders?: Headers;
	}) => {
		await backendFetch(
			`/api/resumes/${input.id}`,
			{
				method: "PUT",
				body: JSON.stringify({
					name: input.name,
					slug: input.slug,
					tags: input.tags,
					data: input.data,
					isPublic: input.isPublic,
				}),
			},
			input.reqHeaders,
		);
	},

	setLocked: async (input: { id: string; isLocked: boolean; reqHeaders?: Headers }) => {
		await backendFetch(
			`/api/resumes/${input.id}/lock`,
			{
				method: "POST",
				body: JSON.stringify({ isLocked: input.isLocked }),
			},
			input.reqHeaders,
		);
	},

	setPassword: async (input: { id: string; password: string; reqHeaders?: Headers }) => {
		await backendFetch(
			`/api/resumes/${input.id}/password`,
			{
				method: "POST",
				body: JSON.stringify({ password: input.password }),
			},
			input.reqHeaders,
		);
	},

	removePassword: async (input: { id: string; reqHeaders?: Headers }) => {
		await backendFetch(`/api/resumes/${input.id}/password`, { method: "DELETE" }, input.reqHeaders);
	},

	duplicate: async (input: { id: string; name?: string; slug?: string; tags?: string[]; reqHeaders?: Headers }) => {
		const response = await backendFetch<{ data: { id: string } }>(
			`/api/resumes/${input.id}/duplicate`,
			{
				method: "POST",
				body: JSON.stringify({ name: input.name, slug: input.slug, tags: input.tags }),
			},
			input.reqHeaders,
		);
		return response.data.id;
	},

	delete: async (input: { id: string; reqHeaders?: Headers }) => {
		await backendFetch(`/api/resumes/${input.id}`, { method: "DELETE" }, input.reqHeaders);
	},
};
