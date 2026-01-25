import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getCandidateAuthUrl } from "@/utils/candidate-auth";
import { getDashboardSidebarServerFn, setDashboardSidebarServerFn } from "./-components/functions";
import { DashboardSidebar } from "./-components/sidebar";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async ({ context, location }) => {
		if (!context.session) {
			const returnTo = typeof window !== "undefined" ? window.location.href : new URL(location.href, process.env.APP_URL).toString();

			if (typeof window !== "undefined") {
				localStorage.setItem("intendedUrl", returnTo);
				window.location.assign(getCandidateAuthUrl(returnTo));
			}

			throw redirect({ href: getCandidateAuthUrl(returnTo), replace: true });
		}
		return { session: context.session };
	},
	loader: async () => {
		const sidebarState = await getDashboardSidebarServerFn();
		return { sidebarState };
	},
});

function RouteComponent() {
	const router = useRouter();
	const { sidebarState } = Route.useLoaderData();

	const handleSidebarOpenChange = (open: boolean) => {
		setDashboardSidebarServerFn({ data: open }).then(() => {
			router.invalidate();
		});
	};

	return (
		<SidebarProvider open={sidebarState} onOpenChange={handleSidebarOpenChange}>
			<DashboardSidebar />

			<main className="@container flex-1 p-4 md:pl-2">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
