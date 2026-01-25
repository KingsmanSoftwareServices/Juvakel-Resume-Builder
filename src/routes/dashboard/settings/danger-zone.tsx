import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings/danger-zone")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-2">
			<h1 className="font-semibold text-2xl">
				<Trans>Danger Zone</Trans>
			</h1>
			<p className="text-muted-foreground">
				<Trans>Account deletion is managed in the main Juvakel platform.</Trans>
			</p>
		</div>
	);
}
