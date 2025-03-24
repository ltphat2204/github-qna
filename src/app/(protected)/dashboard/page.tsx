'use client'
import { useUser } from "@clerk/nextjs"

export default function Dashboard() {
    const { user } = useUser();
    return (
        <div>
            <div>{user?.firstName}</div>
            <div>{user?.lastName}</div>
        </div>
    );
}