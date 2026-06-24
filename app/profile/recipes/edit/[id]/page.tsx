import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import EditWrapper from "./Wrapper";
import { redirect } from "next/navigation";
import { UserType } from "@/types/user";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    const { data: { user }, } = await supabase.auth.getUser();

    if (!user) {
        redirect('/profile')
    }

    const { data: recipe } = await supabase.from('recipes').select('*').eq('id', id).single();


    return <EditWrapper id={id} recipe={recipe} user={user as UserType} />
}

export default Page