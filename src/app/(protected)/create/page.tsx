'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useForm } from "react-hook-form";

interface FormInput {
    repoUrl: string;
    projectName: string;
    githubToken?: string;
}

export default function CreatePage() {
    const { register, handleSubmit, reset} = useForm<FormInput>();

    const onSubmit = (data: FormInput) => {
        console.log(data);
    }

    return (
        <div className="flex items-center gap-12 h-full justify-center">
            <Image src="/undraw-github.svg" alt="GitHub" height={250} width={250} className="h-56 w-auto" />
            <div>
                <div>
                    <h1 className="font-semibold text-2xl">
                        Link your GitHub repository
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the URL of yout repository to link it to Github AI QnA
                    </p>
                </div>
                <div className="h-4"></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input 
                            {...register('projectName', { required: true })}
                            placeholder="Project Name"
                            required/>
                        <div className="h-2"></div>
                        <Input 
                            {...register('repoUrl', { required: true })}
                            placeholder="GitHub Repository URL"
                            required/>
                        <div className="h-2"></div>
                        <Input 
                            {...register('githubToken')}
                            placeholder="GitHub Token (required for private repository only)"/>
                        <div className="h-4"></div>
                        <Button type="submit">
                            Create Project
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}