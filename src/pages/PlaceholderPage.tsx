import { ArrowLeft } from "lucide-react";
import type { ScreenMeta } from "../app/routes";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { IconBadge } from "../components/ui/IconBadge";

type PlaceholderPageProps = {
  screen: ScreenMeta;
};

export function PlaceholderPage({ screen }: PlaceholderPageProps) {
  const Icon = screen.icon;

  return (
    <div className="px-[clamp(1rem,1.5vw,1.65rem)] py-[clamp(1rem,1.35vw,1.5rem)]">
      <PageHeader title={screen.title} subtitle={screen.subtitle} />
      <Card className="mt-6 flex min-h-[22rem] items-center justify-center px-6 text-center">
        <div className="max-w-[32rem]">
          <div className="mx-auto flex justify-center">
            <IconBadge icon={Icon} tone="orange" size="lg" />
          </div>
          <h2 className="mt-5 text-[1.05rem] font-extrabold text-[var(--text-primary)]">
            {screen.label}
          </h2>
          <p className="mt-2 text-[0.86rem] font-medium leading-6 text-[var(--text-secondary)]">
            This screen is queued for the next build pass. The shared shell, navigation, and design system are already in place.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-2 text-[0.76rem] font-bold text-[var(--text-secondary)]">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Use Home in the left navigation to return to the command center.
          </div>
        </div>
      </Card>
    </div>
  );
}
