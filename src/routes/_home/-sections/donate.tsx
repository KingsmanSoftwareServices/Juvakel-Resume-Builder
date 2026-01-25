import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { HeartIcon, type IconProps, RocketIcon, SparkleIcon, UsersIcon, WrenchIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";

type FloatingIconProps = {
	icon: React.ElementType;
	className?: string;
	delay?: number;
};

const FloatingIcon = ({ icon: Icon, className, delay = 0 }: FloatingIconProps) => (
	<motion.div
		className={cn("absolute text-primary/20", className)}
		animate={{
			y: [0, -12, 0],
			rotate: [0, 5, -5, 0],
			scale: [1, 1.1, 1],
		}}
		transition={{
			duration: 4,
			repeat: Infinity,
			delay,
			ease: "easeInOut",
		}}
	>
		<Icon size={32} weight="duotone" />
	</motion.div>
);

const PulsingHeart = () => (
	<motion.div
		className="relative inline-flex items-center justify-center"
		animate={{
			scale: [1, 1.15, 1],
		}}
		transition={{
			duration: 1.5,
			repeat: Infinity,
			ease: "easeInOut",
		}}
	>
		<HeartIcon size={48} weight="fill" className="text-rose-500" />
		<motion.div
			className="absolute inset-0 flex items-center justify-center"
			animate={{
				scale: [1, 1.8],
				opacity: [0.6, 0],
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				ease: "easeOut",
			}}
		>
			<HeartIcon size={48} weight="fill" className="text-rose-500" />
		</motion.div>
	</motion.div>
);

type SparkleEffectProps = {
	className?: string;
};

const SparkleEffect = ({ className }: SparkleEffectProps) => (
	<motion.div
		className={cn("absolute", className)}
		animate={{
			scale: [0, 1, 0],
			opacity: [0, 1, 0],
			rotate: [0, 180],
		}}
		transition={{
			duration: 2,
			repeat: Infinity,
			ease: "easeInOut",
		}}
	>
		<SparkleIcon size={16} weight="fill" className="text-amber-400" />
	</motion.div>
);

type FeatureCardProps = {
	icon: React.ElementType<IconProps>;
	title: string;
	description: string;
	delay: number;
};

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
	<motion.div
		className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/80"
		initial={{ opacity: 0, y: 20 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true }}
		transition={{ duration: 0.5, delay }}
		whileHover={{ y: -4 }}
	>
		<motion.div
			aria-hidden="true"
			className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
			whileHover={{ rotate: [0, -10, 10, 0] }}
			transition={{ duration: 0.4 }}
		>
			<Icon size={24} weight="light" />
		</motion.div>
		<h3 className="font-semibold tracking-tight">{title}</h3>
		<p className="text-muted-foreground leading-relaxed">{description}</p>
	</motion.div>
);

export const DonationBanner = () => (
	<section className="relative overflow-hidden bg-linear-to-b from-background via-primary/2 to-background py-24">
		{/* Background decorative elements */}
		<div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
			<FloatingIcon icon={HeartIcon} className="top-[20%] left-[10%]" delay={0} />
			<FloatingIcon icon={SparkleIcon} className="top-[15%] right-[15%]" delay={0.5} />
			<FloatingIcon icon={UsersIcon} className="bottom-[25%] left-[8%]" delay={1} />
			<FloatingIcon icon={WrenchIcon} className="right-[12%] bottom-[30%]" delay={1.5} />
			<FloatingIcon icon={RocketIcon} className="top-[35%] right-[25%]" delay={2} />
			<FloatingIcon icon={HeartIcon} className="bottom-[20%] left-[20%]" delay={2.5} />

			{/* Gradient Orbs */}
			<div className="absolute top-1/4 -left-32 size-64 rounded-full bg-primary/5 blur-3xl" />
			<div className="absolute -right-32 bottom-1/4 size-64 rounded-full bg-rose-500/5 blur-3xl" />
		</div>

		<div className="container relative px-8">
			{/* Header */}
			<motion.div
				className="flex flex-col items-center text-center"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
			>
				<div aria-hidden="true" className="relative mb-6">
					<PulsingHeart />
					<SparkleEffect className="-top-2 -right-4" />
					<SparkleEffect className="bottom-0 -left-3" />
				</div>

				<motion.h2
					className="mb-6 font-semibold text-2xl tracking-tight md:text-4xl xl:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<Trans>Support Juvakel Resume Builder</Trans>
				</motion.h2>

				<motion.p
					className="max-w-3xl text-base text-muted-foreground leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Trans>
						Juvakel Resume Builder is part of the Juvakel candidate portal. Reach out to our team for support, guidance,
						or feature requests.
					</Trans>
				</motion.p>
			</motion.div>

			{/* Feature cards */}
			<div className="mx-auto my-12 grid max-w-5xl gap-8 sm:grid-cols-3">
				<FeatureCard
					icon={RocketIcon}
					title={t`Get Support`}
					description={t`Connect with the Juvakel team for help with your resume or account.`}
					delay={0.3}
				/>
				<FeatureCard
					icon={WrenchIcon}
					title={t`Share Feedback`}
					description={t`Tell us what works and what could be better so we can keep improving.`}
					delay={0.4}
				/>
				<FeatureCard
					icon={UsersIcon}
					title={t`Stay Updated`}
					description={t`Stay informed about new templates, features, and improvements.`}
					delay={0.5}
				/>
			</div>

			{/* CTA Buttons */}
			<motion.div
				className="flex flex-col items-center justify-center gap-4 sm:flex-row"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, delay: 0.6 }}
			>
				<Button asChild size="lg" className="h-11 gap-2 px-6">
					<a href="https://juvakelteam.co.zw/contact" target="_blank" rel="noopener">
						<HeartIcon aria-hidden="true" weight="fill" className="text-rose-400 dark:text-rose-600" />
						Contact Support
						<span className="sr-only"> ({t`opens in new tab`})</span>
					</a>
				</Button>

				<Button asChild size="lg" className="h-11 gap-2 px-6">
					<a href="https://juvakelteam.co.zw" target="_blank" rel="noopener">
						<RocketIcon aria-hidden="true" weight="fill" className="text-zinc-400 dark:text-zinc-600" />
						Visit Portal
						<span className="sr-only"> ({t`opens in new tab`})</span>
					</a>
				</Button>
			</motion.div>

			{/* Footer note */}
			<motion.p
				className="mt-8 text-center text-muted-foreground leading-relaxed"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, delay: 0.8 }}
			>
				<Trans>Thank you for choosing Juvakel Resume Builder.</Trans>
			</motion.p>
		</div>
	</section>
);
