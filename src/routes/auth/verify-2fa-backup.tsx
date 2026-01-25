import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getCandidateAuthUrl } from "@/utils/candidate-auth";

export const Route = createFileRoute("/auth/verify-2fa-backup")({
	component: RouteComponent,
	beforeLoad: async () => {
		if (typeof window !== "undefined") {
			window.location.assign(getCandidateAuthUrl(window.location.href, "verify-2fa"));
		}
		throw redirect({ to: "/", replace: true });
	},
});

function RouteComponent() {
	return (
		<div className="space-y-4 text-center">
			<h1 className="font-semibold text-2xl">
				<Trans>Backup codes are not supported</Trans>
			</h1>
			<p className="text-muted-foreground">
				<Trans>Email-based verification is used for sign-in on this platform.</Trans>
			</p>
			<Button asChild>
				<Link to="/auth/login">
					<Trans>Back to login</Trans>
				</Link>
			</Button>
		</div>
	);
}
