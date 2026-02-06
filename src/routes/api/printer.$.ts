import { createFileRoute } from "@tanstack/react-router";
import { printerService } from "@/integrations/orpc/services/printer";
import { resumeService } from "@/integrations/orpc/services/resume";
import { getLocale } from "@/utils/locale";

async function handler({ request }: { request: Request }) {
	const url = new URL(request.url);
	const path = url.pathname;
	const body = await request.json().catch(() => ({} as { id?: string }));
	const id = body?.id ?? url.searchParams.get("id");

	if (!id) {
		return Response.json({ message: "Missing resume id" }, { status: 400 });
	}

	const locale = await getLocale();
	const authorization = request.headers.get("authorization");
	const cookie = request.headers.get("cookie");
	const resume = authorization || cookie
		? await resumeService.getByIdForPrinter({ id, reqHeaders: request.headers })
		: await resumeService.getPublicById({ id });

	if (path.endsWith("/pdf")) {
		const url = await printerService.printResumeAsPDF({ ...resume, reqHeaders: request.headers });
		return Response.json({ url, locale });
	}

	if (path.endsWith("/screenshot")) {
		const url = await printerService.getResumeScreenshot({ ...resume, reqHeaders: request.headers });
		return Response.json({ url, locale });
	}

	return new Response("NOT_FOUND", { status: 404 });
}

export const Route = createFileRoute("/api/printer/$")({
	server: {
		handlers: {
			POST: handler,
			GET: handler,
		},
	},
});
