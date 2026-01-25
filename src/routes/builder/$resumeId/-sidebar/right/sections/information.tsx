import { Trans } from "@lingui/react/macro";
import { HandHeartIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SectionBase } from "../shared/section-base";

export function InformationSectionBuilder() {
	return (
		<SectionBase type="information" className="space-y-4">
			<div className="space-y-2 rounded-md border bg-sky-600 p-5 text-white dark:bg-sky-700">
				<h4 className="font-medium tracking-tight">
					<Trans>Need help or have feedback?</Trans>
				</h4>

				<div className="space-y-2 text-xs leading-normal">
					<Trans>
						<p>
							Thanks for using Juvakel Resume Builder. We're committed to helping you build standout resumes quickly and
							consistently.
						</p>
						<p>
							Reach out any time for support, feedback, or feature requests.
						</p>
					</Trans>
				</div>

				<Button asChild size="sm" variant="default" className="mt-2 whitespace-normal px-4! text-xs">
					<a href="https://juvakelteam.co.zw/contact" target="_blank" rel="noopener">
						<HandHeartIcon />
						<span className="truncate">
							<Trans>Contact Support</Trans>
						</span>
					</a>
				</Button>
			</div>

			<div className="flex flex-wrap gap-0.5">
				<Button asChild size="sm" variant="link" className="text-xs">
					<a href="https://juvakelteam.co.zw" target="_blank" rel="noopener">
						<Trans>Juvakel Portal</Trans>
					</a>
				</Button>

				<Button asChild size="sm" variant="link" className="text-xs">
					<a href="https://juvakelteam.co.zw/terms" target="_blank" rel="noopener">
						<Trans>Terms</Trans>
					</a>
				</Button>

				<Button asChild size="sm" variant="link" className="text-xs">
					<a href="https://juvakelteam.co.zw/privacy" target="_blank" rel="noopener">
						<Trans>Privacy</Trans>
					</a>
				</Button>

				<Button asChild size="sm" variant="link" className="text-xs">
					<a href="https://juvakelteam.co.zw/contact" target="_blank" rel="noopener">
						<Trans>Report a Bug</Trans>
					</a>
				</Button>

				<Button asChild size="sm" variant="link" className="text-xs">
					<a href="https://juvakelteam.co.zw/contact" target="_blank" rel="noopener">
						<Trans>Contact</Trans>
					</a>
				</Button>
			</div>
		</SectionBase>
	);
}
