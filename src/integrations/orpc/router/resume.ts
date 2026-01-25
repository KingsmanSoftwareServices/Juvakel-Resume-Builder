import z from "zod";
import { resumeDataSchema } from "@/schema/resume/data";
import { sampleResumeData } from "@/schema/resume/sample";
import { generateRandomName, slugify } from "@/utils/string";
import { protectedProcedure, publicProcedure, serverOnlyProcedure } from "../context";
import { resumeService } from "../services/resume";

const tagsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/resume/tags/list",
			tags: ["Resume"],
			summary: "List all resume tags",
			description: "List all tags for the authenticated user's resumes. Used to populate the filter in the dashboard.",
		})
		.output(z.array(z.string()))
		.handler(async ({ context }) => {
			return await resumeService.tags.list({ reqHeaders: context.reqHeaders });
		}),
};

const statisticsRouter = {
	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/resume/statistics/getById",
			tags: ["Resume"],
			summary: "Get resume statistics",
			description: "Get the statistics for a resume, such as number of views and downloads.",
		})
		.input(z.object({ id: z.string() }))
		.output(
			z.object({
				isPublic: z.boolean(),
				views: z.number(),
				downloads: z.number(),
				lastViewedAt: z.date().nullable(),
				lastDownloadedAt: z.date().nullable(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await resumeService.statistics.getById({ id: input.id, reqHeaders: context.reqHeaders });
		}),

	increment: publicProcedure
		.route({ tags: ["Internal"], summary: "Increment resume statistics" })
		.input(z.object({ id: z.string(), views: z.boolean().default(false), downloads: z.boolean().default(false) }))
		.handler(async ({ input }) => {
			return await resumeService.statistics.increment(input);
		}),
};

export const resumeRouter = {
	tags: tagsRouter,
	statistics: statisticsRouter,

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/resume/list",
			tags: ["Resume"],
			summary: "List all resumes",
			description: "List of all the resumes for the authenticated user.",
		})
		.input(
			z
				.object({
					tags: z.array(z.string()).optional().default([]),
					sort: z.enum(["lastUpdatedAt", "createdAt", "name"]).optional().default("lastUpdatedAt"),
				})
				.optional()
				.default({ tags: [], sort: "lastUpdatedAt" }),
		)
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					slug: z.string(),
					tags: z.array(z.string()),
					isPublic: z.boolean(),
					isLocked: z.boolean(),
					createdAt: z.date(),
					updatedAt: z.date(),
				}),
			),
		)
		.handler(async ({ input, context }) => {
			return await resumeService.list({
				tags: input.tags,
				sort: input.sort,
				reqHeaders: context.reqHeaders,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/resume/getById",
			tags: ["Resume"],
			summary: "Get resume by ID",
			description: "Get a resume, along with its data, by its ID.",
		})
		.input(z.object({ id: z.string() }))
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				slug: z.string(),
				tags: z.array(z.string()),
				data: resumeDataSchema,
				isPublic: z.boolean(),
				isLocked: z.boolean(),
				hasPassword: z.boolean(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await resumeService.getById({ id: input.id, reqHeaders: context.reqHeaders });
		}),

	getByIdForPrinter: serverOnlyProcedure
		.route({ tags: ["Internal"], summary: "Get resume by ID for printer" })
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			return await resumeService.getByIdForPrinter({ id: input.id, reqHeaders: context.reqHeaders });
		}),

	getPublicById: publicProcedure
		.route({
			method: "GET",
			path: "/resume/getPublicById",
			tags: ["Resume"],
			summary: "Get public resume by ID",
			description: "Get a public resume by its ID.",
		})
		.input(z.object({ id: z.string() }))
		.output(
			z.object({
				id: z.string(),
				name: z.string(),
				slug: z.string(),
				tags: z.array(z.string()),
				data: resumeDataSchema,
				isPublic: z.boolean(),
				isLocked: z.boolean(),
			}),
		)
		.handler(async ({ input }) => {
			return await resumeService.getPublicById({ id: input.id });
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/create",
			tags: ["Resume"],
			summary: "Create a new resume",
			description: "Create a new resume, with the ability to initialize it with sample data.",
		})
		.input(
			z.object({
				name: z.string().min(1).max(64),
				slug: z.string().min(1).max(64),
				tags: z.array(z.string()),
				withSampleData: z.boolean().default(false),
			}),
		)
		.output(z.string().describe("The ID of the created resume."))
		.errors({
			RESUME_SLUG_ALREADY_EXISTS: {
				message: "A resume with this slug already exists.",
				status: 400,
			},
		})
		.handler(async ({ context, input }) => {
			return await resumeService.create({
				name: input.name,
				slug: input.slug,
				tags: input.tags,
				reqHeaders: context.reqHeaders,
				data: input.withSampleData ? sampleResumeData : undefined,
			});
		}),

	import: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/import",
			tags: ["Resume"],
			summary: "Import a resume",
			description: "Import a resume from a file.",
		})
		.input(z.object({ data: resumeDataSchema }))
		.output(z.string().describe("The ID of the imported resume."))
		.errors({
			RESUME_SLUG_ALREADY_EXISTS: {
				message: "A resume with this slug already exists.",
				status: 400,
			},
		})
		.handler(async ({ context, input }) => {
			const name = generateRandomName();
			const slug = slugify(name);

			return await resumeService.create({
				name,
				slug,
				tags: [],
				data: input.data,
				reqHeaders: context.reqHeaders,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/resume/update",
			tags: ["Resume"],
			summary: "Update a resume",
			description: "Update a resume, along with its data, by its ID.",
		})
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				slug: z.string().optional(),
				tags: z.array(z.string()).optional(),
				data: resumeDataSchema.optional(),
				isPublic: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.errors({
			RESUME_SLUG_ALREADY_EXISTS: {
				message: "A resume with this slug already exists.",
				status: 400,
			},
		})
		.handler(async ({ context, input }) => {
			return await resumeService.update({
				id: input.id,
				reqHeaders: context.reqHeaders,
				name: input.name,
				slug: input.slug,
				tags: input.tags,
				data: input.data,
				isPublic: input.isPublic,
			});
		}),

	setLocked: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/setLocked",
			tags: ["Resume"],
			summary: "Set resume locked status",
			description: "Toggle the locked status of a resume, by its ID.",
		})
		.input(z.object({ id: z.string(), isLocked: z.boolean() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeService.setLocked({
				id: input.id,
				reqHeaders: context.reqHeaders,
				isLocked: input.isLocked,
			});
		}),

	setPassword: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/setPassword",
			tags: ["Resume"],
			summary: "Set password on a resume",
			description: "Set a password on a resume to protect it from unauthorized access when shared publicly.",
		})
		.input(z.object({ id: z.string(), password: z.string().min(6).max(64) }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeService.setPassword({
				id: input.id,
				reqHeaders: context.reqHeaders,
				password: input.password,
			});
		}),

	removePassword: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/removePassword",
			tags: ["Resume"],
			summary: "Remove password from a resume",
			description: "Remove password protection from a resume.",
		})
		.input(z.object({ id: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeService.removePassword({
				id: input.id,
				reqHeaders: context.reqHeaders,
			});
		}),

	duplicate: protectedProcedure
		.route({
			method: "POST",
			path: "/resume/duplicate",
			tags: ["Resume"],
			summary: "Duplicate a resume",
			description: "Duplicate a resume, by its ID.",
		})
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				slug: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string().describe("The ID of the duplicated resume."))
		.handler(async ({ context, input }) => {
			const original = await resumeService.getById({ id: input.id, reqHeaders: context.reqHeaders });

			return await resumeService.create({
				reqHeaders: context.reqHeaders,
				name: input.name ?? original.name,
				slug: input.slug ?? original.slug,
				tags: input.tags ?? original.tags,
				data: original.data,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/resume/delete",
			tags: ["Resume"],
			summary: "Delete a resume",
			description: "Delete a resume, by its ID.",
		})
		.input(z.object({ id: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await resumeService.delete({ id: input.id, reqHeaders: context.reqHeaders });
		}),
};
