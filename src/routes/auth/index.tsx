import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCandidateAuthUrl } from "@/utils/candidate-auth";

export const Route = createFileRoute("/auth/")({
	beforeLoad: async ({ context }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });
		if (typeof window !== "undefined") {
			window.location.assign(getCandidateAuthUrl(window.location.href));
		}
		throw redirect({ to: "/", replace: true });
	},
});
