'use client'

import { AlertDialog } from 'radix-ui'

import { Button } from '../ui/button'
import { deleteRecipe } from '@/lib/actions/recipe'
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const RecipeDeleteBtn = ({ id }: { id: string }) => {
    const router = useRouter();
    const { fetchUser } = useAuth();

    const handleDelete = async () => {
        try {
            await deleteRecipe(id);
            toast.success("Recipe deleted successfully!");
            fetchUser();
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <Button size="lg" variant="destructive" className="flex-1 cursor-pointer">
                    Delete Recipe
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg">
                    <div className="grid gap-2">
                        <AlertDialog.Title className="text-lg font-semibold">
                            Delete recipe?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently delete this recipe.
                        </AlertDialog.Description>
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <AlertDialog.Cancel asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <Button type="button" variant="destructive" onClick={handleDelete}>
                                Confirm Delete
                            </Button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}

export default RecipeDeleteBtn
