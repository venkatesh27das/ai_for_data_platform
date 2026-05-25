import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Admin } from "../pages/Admin";
import { AgentConsole } from "../pages/AgentConsole";
import { ConsumptionHub } from "../pages/ConsumptionHub";
import { DataJourneys } from "../pages/DataJourneys";
import { Home } from "../pages/Home";
import { HumanReviewQueue } from "../pages/HumanReviewQueue";
import { Observability } from "../pages/Observability";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import type { ScreenId } from "./routes";
import { screenMeta } from "./routes";

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {activeScreen === "home" && <Home onNavigate={setActiveScreen} />}
      {activeScreen === "journeys" && <DataJourneys onNavigate={setActiveScreen} />}
      {activeScreen === "agents" && <AgentConsole onNavigate={setActiveScreen} />}
      {activeScreen === "reviews" && <HumanReviewQueue />}
      {activeScreen === "consumption" && <ConsumptionHub />}
      {activeScreen === "observability" && <Observability />}
      {activeScreen === "admin" && <Admin />}
      {activeScreen !== "home" &&
        activeScreen !== "journeys" &&
        activeScreen !== "agents" &&
        activeScreen !== "reviews" &&
        activeScreen !== "consumption" &&
        activeScreen !== "observability" &&
        activeScreen !== "admin" && (
        <PlaceholderPage screen={screenMeta[activeScreen]} />
      )}
    </AppShell>
  );
}
