import AppStatePage from "@/components/AppStatePage";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <AppStatePage
      eyebrow="404 - Not found!"
      title="Recipe not found"
      description="The page you are looking for may have been moved, removed, or never made it to the table."
      icon={SearchX}
      actions={
        <>
          <Button variant="hero" asChild className="h-10 rounded-sm px-5">
            <Link href="/">
              <Home size={18} />
              Back to Feed
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-10 rounded-sm px-5">
            <Link href="/explore">Explore Recipes</Link>
          </Button>
        </>
      }
    />
  );
}
