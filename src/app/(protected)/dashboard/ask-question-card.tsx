'use client'

import MDEditor from '@uiw/react-md-editor';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from './code-references';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

export default function AskQuestionCard() {
    const { project } = useProject();
    const [question, setQuestion] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileReferences, setFileReferences] = useState<{ fileName: string; sourceCode: string; summary: string}[]>([]);
    const [answer, setAnswer] = useState('');
    const saveAnswer = api.project.saveAnswer.useMutation();

    const onSubmit = async(e: React.FormEvent) => {
        setAnswer('');
        setFileReferences([]);

        e.preventDefault();
        if (!project?.id) return;

        setLoading(true);

        const { output, filesReferences } = await askQuestion(question, project.id);
        setIsDialogOpen(true);
        setFileReferences(filesReferences);

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta);
            }
        }

        setLoading(false);
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='sm:max-w-[80vw]'>
                    <DialogHeader>
                        <div className='flex items-center gap-2'>
                            <DialogTitle>
                                <div className="flex items-center gap-2">
                                    <Image src="/github-logo.jpg" width={40} height={40} alt="AI Logo" />
                                    <h1 className="text-xl font-bold text-primary/80">AI QnA</h1>
                                </div>
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant='outline' onClick={() =>
                                saveAnswer.mutate({
                                    projectId: project!.id,
                                    question,
                                    answer,
                                    filesReferences: fileReferences
                                }, {
                                    onSuccess: () => {
                                        toast.success('Answer saved successfully');
                                    },
                                    onError: (error) => {
                                        toast.error(error.message);
                                    }
                                })
                            }>
                                Save answer
                            </Button>
                        </div>
                        
                    </DialogHeader>

                    <div data-color-mode="light">
                        <div className="wmde-markdown-var"> </div>
                        <MDEditor.Markdown source={answer} className='max-w-[70vw] mx-auto !h-full max-h-[40vh] overflow-auto' />
                    </div>
                    <div className="h-4"></div>
                    <CodeReferences filesReferences={fileReferences} />
                </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder="Which file should I edit to change the home page?" value={question} onChange={e => setQuestion(e.target.value)}/>
                        <div className="h-4"></div>
                        <Button type="submit" disabled={loading}>Ask</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}