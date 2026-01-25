import { createFileRoute } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";

export const Route = createFileRoute("/dashboard/settings/api-keys")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-2">
			<h1 className="font-semibold text-2xl">
				<Trans>API Keys</Trans>
			</h1>
			<p className="text-muted-foreground">
				<Trans>API keys are managed in the main Juvakel platform.</Trans>
			</p>
		</div>
	);
}
