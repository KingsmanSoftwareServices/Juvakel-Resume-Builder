import z from "zod";
import { publicProcedure } from "../context";
import { statisticsService } from "../services/statistics";

const userRouter = {
	getCount: publicProcedure
		.route({
			method: "GET",
			path: "/statistics/user/getCount",
			tags: ["Statistics"],
			summary: "Get total number of users",
			description: "Get the total number of users for the Juvakel Resume Builder.",
		})
		.output(z.number())
		.handler(async (): Promise<number> => {
			return await statisticsService.user.getCount();
		}),
};

const resumeRouter = {
	getCount: publicProcedure
		.route({
			method: "GET",
			path: "/statistics/resume/getCount",
			tags: ["Statistics"],
			summary: "Get total number of resumes",
			description: "Get the total number of resumes for the Juvakel Resume Builder.",
		})
		.output(z.number())
		.handler(async (): Promise<number> => {
			return await statisticsService.resume.getCount();
		}),
};

const githubRouter = {
	getStarCount: publicProcedure
		.route({
			method: "GET",
			path: "/statistics/github/getStarCount",
			tags: ["Statistics"],
			summary: "Get GitHub Repository stargazers count",
			description: "Get the stargazers count for the Juvakel Resume Builder GitHub repository, at the time of writing.",
		})
		.output(z.number())
		.handler(async (): Promise<number> => {
			return await statisticsService.github.getStarCount();
		}),
};

export const statisticsRouter = {
	user: userRouter,
	resume: resumeRouter,
	github: githubRouter,
};
