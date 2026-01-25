import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCandidateAuthUrl } from "@/utils/candidate-auth";

export const Route = createFileRoute("/auth/")({
	beforeLoad: async ({ context, location }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });

		const returnTo = typeof window !== "undefined" ? window.location.href : new URL(location.href, process.env.APP_URL).toString();

		if (typeof window !== "undefined") {
			window.location.assign(getCandidateAuthUrl(returnTo));
		}

		throw redirect({ href: getCandidateAuthUrl(returnTo), replace: true });
	},
});
