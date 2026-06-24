"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import AppStatePage from "@/components/AppStatePage";
import { Button } from "@/components/ui/button";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppStatePage
          eyebrow="Critical error"
          title="RecipeVerse needs a refresh"
          description="The app ran into a problem while rendering. Refresh the app to rebuild the page state."
          icon={AlertTriangle}
          className="min-h-screen"
          actions={
            <Button
              type="button"
              variant="hero"
              className="h-10 rounded-sm px-5"
              onClick={reset}
            >
              <RefreshCw size={18} />
              Refresh App
            </Button>
          }
        />
      </body>
    </html>
  );
}
