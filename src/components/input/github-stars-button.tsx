import { t } from "@lingui/core/macro";
import { GlobeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function GithubStarsButton() {
	return (
		<Button asChild variant="outline">
			<a
				target="_blank"
				href="https://juvakelteam.co.zw"
				aria-label={t`Visit Juvakel (opens in new tab)`}
				rel="noopener"
			>
				<GlobeIcon aria-hidden="true" />
				<span className="font-bold">{t`Visit Juvakel`}</span>
			</a>
		</Button>
	);
}
