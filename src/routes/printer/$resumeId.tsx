import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect } from "react";
import { z } from "zod";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStore } from "@/components/resume/store/resume";
import { backendRequest } from "@/integrations/backend/client";
import { env } from "@/utils/env";
import { verifyPrinterToken } from "@/utils/printer-token";

const searchSchema = z.object({
	token: z.string().catch(""),
});

export const Route = createFileRoute("/printer/$resumeId")({
	component: RouteComponent,
	validateSearch: zodValidator(searchSchema),
	beforeLoad: async ({ params, search }) => {
		if (env.FLAG_DEBUG_PRINTER) return;

		try {
			// Verify the token and ensure it matches the resume ID
			const tokenResumeId = verifyPrinterToken(search.token);
			if (tokenResumeId !== params.resumeId) throw new Error();
		} catch {
			// Invalid or missing token - throw error to be caught by error handler
			throw redirect({ to: "/", search: {}, throw: true });
		}
	},
	loader: async ({ params }) => {
		const response = await backendRequest<{ data: any }>(`/api/resumes/${params.resumeId}`, { method: "GET" });
		const resume = (response as { data?: any }).data ?? response;

		return { resume };
	},
});

function RouteComponent() {
	const { resume } = Route.useLoaderData();

	const isReady = useResumeStore((state) => state.isReady);
	const initialize = useResumeStore((state) => state.initialize);

	useEffect(() => {
		if (!resume) return;
		initialize(resume);
		return () => initialize(null);
	}, [resume, initialize]);

	if (!isReady) return <LoadingScreen />;

	return <ResumePreview pageClassName="print:w-full!" />;
}
