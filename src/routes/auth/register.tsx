import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/integrations/auth/client";
import { getCandidateAuthUrl } from "@/utils/candidate-auth";

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });
		if (context.flags.disableSignups) {
			if (typeof window !== "undefined") {
				window.location.assign(getCandidateAuthUrl(window.location.href, "login"));
			}
			throw redirect({ to: "/", replace: true });
		}
		if (typeof window !== "undefined") {
			window.location.assign(getCandidateAuthUrl(window.location.href, "register"));
		}
		throw redirect({ to: "/", replace: true });
	},
});

const formSchema = z.object({
	email: z.email().toLowerCase(),
	password: z
		.string()
		.min(8)
		.max(64)
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
});

type FormValues = z.infer<typeof formSchema>;

function RouteComponent() {
	const [submitted, setSubmitted] = useState(false);
	const [showPassword, toggleShowPassword] = useToggle(false);
	const { flags } = Route.useRouteContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		const toastId = toast.loading(t`Signing up...`);

		const { error } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		setSubmitted(true);
		toast.dismiss(toastId);
	};

	if (submitted) return <PostSignupScreen />;

	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>Create a new account</Trans>
				</h1>

				<div className="text-muted-foreground">
					<Trans>
						Already have an account?{" "}
						<Button asChild variant="link" className="h-auto gap-1.5 px-1! py-0">
							<Link to="/auth/login">
								Sign in now <ArrowRightIcon />
							</Link>
						</Button>
					</Trans>
				</div>
			</div>

			{!flags.disableEmailAuth && (
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Email Address</Trans>
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder="john.doe@example.com"
											className="lowercase"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Password</Trans>
									</FormLabel>
									<div className="flex items-center gap-x-1.5">
										<FormControl>
											<Input
												min={8}
												max={64}
												type={showPassword ? "text" : "password"}
												autoComplete="new-password"
												{...field}
											/>
										</FormControl>

										<Button size="icon" variant="ghost" onClick={toggleShowPassword}>
											{showPassword ? <EyeIcon /> : <EyeSlashIcon />}
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full">
							<Trans>Sign up</Trans>
						</Button>
					</form>
				</Form>
			)}
		</>
	);
}

function PostSignupScreen() {
	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>You've got mail!</Trans>
				</h1>
				<p className="text-muted-foreground">
					<Trans>Check your email for a link to verify your account.</Trans>
				</p>
			</div>

			<Alert>
				<AlertTitle>
					<Trans>This step is optional, but recommended.</Trans>
				</AlertTitle>
				<AlertDescription>
					<Trans>Verifying your email is required when resetting your password.</Trans>
				</AlertDescription>
			</Alert>

			<Button asChild>
				<Link to="/dashboard">
					<Trans>Continue</Trans> <ArrowRightIcon />
				</Link>
			</Button>
		</>
	);
}
