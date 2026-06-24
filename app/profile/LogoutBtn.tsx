"use client";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

const LogoutBtn = () => {
    const router = useRouter();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/login");
            toast.success("Logout successful");
        } catch (error) {
             toast.error("Logout failed");
        }
    }
    return (
        <Button
            onClick={() => handleLogout()}
            variant="outline"
            size="sm"
            className="flex-1 h-10 py-2 text-sm text-red-500 border border-red-500 hover:text-white hover:bg-red-400"
        >
            <LogOut />
            Logout
        </Button>
    );
};

export default LogoutBtn;