import {
  BadgeCheck,
  Database,
  Network,
  Rocket,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const stages = [
  {
    label: "Connect",
    detail: "71 governed assets",
    path: "/projects/customer-360/assets",
    icon: Database,
  },
  {
    label: "Model",
    detail: "1,842 entities",
    path: "/projects/customer-360/graph",
    icon: Network,
  },
  {
    label: "Govern",
    detail: "56 policy bindings",
    path: "/projects/customer-360/build",
    icon: ShieldCheck,
  },
  {
    label: "Validate",
    detail: "86% quality score",
    path: "/projects/customer-360/quality",
    icon: BadgeCheck,
  },
  {
    label: "Publish",
    detail: "5 serving endpoints",
    path: "/projects/customer-360/publish",
    icon: Rocket,
  },
  {
    label: "Consume",
    detail: "24.6K weekly uses",
    path: "/projects/customer-360/usage",
    icon: TrendingUp,
  },
] as const;

const routeStage: Record<string, number> = {
  assets: 0,
  graph: 1,
  build: 2,
  quality: 3,
  publish: 4,
  usage: 5,
  activity: 5,
};

export function Customer360StoryBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.pathname.split("/").at(-1) ?? "";
  const activeStage = routeStage[route] ?? -1;

  return (
    <section aria-label="Customer 360 demo journey" className="customer360-story">
      <header>
        <div>
          <strong>Customer 360 assembly journey</strong>
          <span>From governed enterprise assets to measurable AI consumption</span>
        </div>
        <em>Current knowledge product</em>
      </header>
      <div className="customer360-story__stages">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const state =
            index === activeStage
              ? "is-active"
              : activeStage >= 0 && index < activeStage
                ? "is-complete"
                : "";

          return (
            <button
              aria-current={index === activeStage ? "step" : undefined}
              className={state}
              key={stage.label}
              onClick={() => navigate(stage.path)}
              type="button"
            >
              <i>
                <Icon aria-hidden="true" size={15} />
              </i>
              <span>
                <strong>{stage.label}</strong>
                <small>{stage.detail}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
