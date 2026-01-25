import z from "zod";
import { protectedProcedure, publicProcedure } from "../context";
import { authService, type ProviderList } from "../services/auth";

export const authRouter = {
	providers: {
		list: publicProcedure
			.route({
				method: "GET",
				path: "/auth/providers/list",
				tags: ["Authentication"],
				summary: "List all auth providers",
				description:
					"A list of all authentication providers, and their display names, supported by the instance of Juvakel Resume Builder.",
			})
			.handler((): ProviderList => {
				return authService.providers.list();
			}),
	},

	verifyResumePassword: publicProcedure
		.route({
			method: "POST",
			path: "/auth/verifyResumePassword",
			tags: ["Authentication", "Resume"],
			summary: "Verify resume password",
			description: "Verify a resume password, to grant access to the locked resume.",
		})
		.input(
			z.object({
				id: z.string().min(1),
				password: z.string().min(1),
			}),
		)
		.output(z.boolean())
		.handler(async ({ input }): Promise<boolean> => {
			return await authService.verifyResumePassword({
				id: input.id,
				password: input.password,
			});
		}),

	deleteAccount: protectedProcedure
		.route({
			method: "DELETE",
			path: "/auth/deleteAccount",
			tags: ["Authentication"],
			summary: "Delete user account",
			description: "Delete the authenticated user's account and all associated data.",
		})
		.handler(async (): Promise<void> => {
			return await authService.deleteAccount();
		}),
};
