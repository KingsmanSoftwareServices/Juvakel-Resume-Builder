import { createFileRoute } from "@tanstack/react-router";
function handler() {
	return new Response(
		JSON.stringify({ success: false, message: "Authentication is handled by the backend service." }),
		{ status: 404, headers: { "Content-Type": "application/json" } },
	);
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		},
	},
});
