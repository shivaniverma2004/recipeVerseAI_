"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import AppStatePage from "@/components/AppStatePage";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppStatePage
      eyebrow="Something went wrong"
      title="We could not load this page"
      description="Try refreshing this section. If the issue continues, return to the recipe feed and start again."
      icon={AlertTriangle}
      actions={
        <>
          <Button
            type="button"
            variant="hero"
            className="h-10 rounded-sm px-5"
            onClick={reset}
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
          <Button variant="outline" asChild className="h-10 rounded-sm px-5">
            <Link href="/">
              <Home size={18} />
              Back to Feed
            </Link>
          </Button>
        </>
      }
    />
  );
}
