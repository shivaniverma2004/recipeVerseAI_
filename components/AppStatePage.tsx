import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AppStatePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions: ReactNode;
  className?: string;
};

const AppStatePage = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  className,
}: AppStatePageProps) => {
  return (
    <main
      className={cn(
        "relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-5 py-24 md:px-10",
        className
      )}
    >
      <div className="absolute -top-8 left-0 right-0 h-72 -skew-y-6 bg-primary/10" />
      <Card className="relative z-10 w-full max-w-lg rounded-xl border-surface/20 px-3 py-5 text-center shadow-sm md:px-6">
        <CardHeader className="items-center gap-4 py-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 mx-auto">
            <Icon size={30} strokeWidth={2.2} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">
              {eyebrow}
            </p>
            <CardTitle className="text-2xl font-bold text-primary-text md:text-3xl">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="max-w-sm text-sm leading-6 text-secondary-text md:text-base">
            {description}
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            {actions}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default AppStatePage;
