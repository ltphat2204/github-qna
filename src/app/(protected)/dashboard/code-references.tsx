'use client'

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeReferencesProps {
    filesReferences: { fileName: string; sourceCode: string; summary: string}[];
}

export default function CodeReferences({ filesReferences }: CodeReferencesProps) {
    const [tab, setTab] = useState(filesReferences[0]?.fileName ?? '');
    if (!filesReferences.length) return null;

    return (
        <div className="max-w-[70vw] mx-auto">
            <Tabs value={tab} onValueChange={setTab}>
                <div className="overflow-auto flex gap-2 bg-gray-200 p-1 rounded-md">
                    {filesReferences.map((file) => (
                        <button onClick={()=>setTab(file.fileName)} key={file.fileName} value={file.fileName} className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted',
                            {
                                'bg-primary text-primary-foreground': tab === file.fileName
                            }
                        )} >
                            {file.fileName}
                        </button>
                    ))}
                </div>
                {filesReferences.map((file) => (
                    <TabsContent key={file.fileName} value={file.fileName} className="max-h-[40vh] overflow-auto max-w-7xl rounded-md">
                        <SyntaxHighlighter language="typescript" style={lucario} wrapLines={true}>
                            {file.sourceCode}
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}