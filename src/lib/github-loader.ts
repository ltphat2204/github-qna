import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { generateEmbedding, summarizeCode } from './gemini';
import { db } from '@/server/db';

export const loadGithubRepo = async(githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    });

    const docs = await loader.load();
    return docs;
}

export const indexGithubRepo = async(projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs);
    await Promise.allSettled(allEmbeddings.map(async(embedding, index) => {
        console.log(`Processing ${index} of ${allEmbeddings.length}`);
        if (!embedding) return;

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                projectId,
                fileName: embedding.fileName,
                sourceCode: embedding.sourceCode,
                summary: embedding.summary
            }
        });

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `;
    }));
}

const generateEmbeddings = async(docs: Document[]) => {
    const results = [];
    const chunkSize = 3; // Process 3 documents at a time
    
    for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk.map(async(doc) => {
            try {
                const summary = await summarizeCode(doc);
                const embedding = await generateEmbedding(summary);
                
                return {
                    summary,
                    embedding,
                    sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
                    fileName: doc.metadata.source,
                };
            } catch (error) {
                console.error(`Error processing doc ${doc.metadata.source}:`, error);
                return null;
            }
        }));
        
        results.push(...chunkResults.filter(r => r !== null));

        if (i + chunkSize < docs.length) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
    }
    
    return results;
}