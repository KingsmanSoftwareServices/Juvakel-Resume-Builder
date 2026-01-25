const normalizeBase = (base: string) => {
	if (!base || base === "/") return "/";
	return base.endsWith("/") ? base : `${base}/`;
};

export const withBasePath = (path: string) => {
	const base = normalizeBase(import.meta.env.BASE_URL ?? "/");
	const normalized = path.startsWith("/") ? path.slice(1) : path;
	if (base === "/") return `/${normalized}`;
	return `${base}${normalized}`;
};
