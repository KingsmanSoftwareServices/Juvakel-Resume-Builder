import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const axiosInstance: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

const getAccessToken = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("accessToken");
};

const clearAuthStorage = () => {
	if (typeof window === "undefined") return;
	localStorage.removeItem("accessToken");
	localStorage.removeItem("pendingEmail");
};

axiosInstance.interceptors.request.use(
	(config) => {
		const token = getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const refresh = await axios.post(
					`${BASE_URL}/api/auth/refresh-token`,
					{},
					{ withCredentials: true },
				);
				const newAccessToken = refresh.data?.data?.accessToken;
				if (newAccessToken && typeof window !== "undefined") {
					localStorage.setItem("accessToken", newAccessToken);
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					return axiosInstance(originalRequest);
				}
			} catch {
				clearAuthStorage();
				if (typeof window !== "undefined") {
					window.location.href = "/auth/login";
				}
			}
		}

		if (error.response?.status === 401) {
			clearAuthStorage();
		}

		return Promise.reject(error);
	},
);

export class BackendApi {
	static async request<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const response = await axiosInstance.request<T>({
			url: endpoint,
			...config,
		});
		return response.data as T;
	}

	static async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>(endpoint, { method: "GET", ...config });
	}

	static async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>(endpoint, { method: "POST", data, ...config });
	}

	static async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>(endpoint, { method: "PUT", data, ...config });
	}

	static async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE", ...config });
	}
}

export { BASE_URL as BACKEND_BASE_URL };
