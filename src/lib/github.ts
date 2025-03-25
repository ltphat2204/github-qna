import { db } from '@/server/db';
import { Octokit } from 'octokit';
import axios from 'axios';
import { aiSummarizeCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const githubUrl = "https://github.com/ltphat2204/java-chatapp"

interface Response {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid Github URL');
    }

    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
    });

    const sortedCommits = data.sort((a, b) => {
        return new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime();
    });

    return sortedCommits.slice(0, 10).map((commit) => {
        const { sha, commit: { message, author: { name, date } }, author: { avatar_url } } = commit;
        return {
            commitHash: sha,
            commitMessage: message,
            commitAuthorName: name,
            commitAuthorAvatar: avatar_url,
            commitDate: date
        }
    });
}

export const pollCommit = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithub(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit) => summarizeCommit(githubUrl, commit.commitHash)));
    const summaries = summaryResponses.map((response) => {
        if (response.status === 'fulfilled') {
            return response.value as string;
        }
        return "";
    });

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            return {
                projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary
            }
        })
    });

    return commits;
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    });

    return await aiSummarizeCommit(data);
}

async function fetchProjectGithub(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }   
    });

    if (!project?.githubUrl) {
        throw new Error('Project has to Github url');
    }

    return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const commits = await db.commit.findMany({
        where: {
            projectId
        }
    });

    const unprocessedCommits = commitHashes.filter((commit) => {
        return !commits.some((dbCommit) => dbCommit.commitHash === commit.commitHash);
    });
    return unprocessedCommits;
}

pollCommit('cm8o9j7n70000en9vtnilhmgg').then(console.log)