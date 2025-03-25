import { pollCommit } from "@/lib/github";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure.input(
    z.object({
      repoUrl: z.string(),
      projectName: z.string(),
      githubToken: z.string().optional(),
    }),
  ).mutation(async ({ctx, input}) => {
    const project = await ctx.db.project.create({
      data: {
        githubUrl: input.repoUrl,
        name: input.projectName,
        UserToProject: {
          create: {
            userId: ctx.user.userId!,
          },
        },
      }
    });

    await pollCommit(project.id);

    return project;
  }),

  getProjects: protectedProcedure.query(async ({ctx}) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deleteAt: null
      },
    });

    return projects;
  }),

  getCommits: protectedProcedure.input(z.object({
    projectId: z.string(),
  })).query(async ({ctx, input}) => {
    pollCommit(input.projectId).then().catch(console.error);
    return await ctx.db.commit.findMany({
      where: {
        projectId: input.projectId,
      },
    });
  })
});
