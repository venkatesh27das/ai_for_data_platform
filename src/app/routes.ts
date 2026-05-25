import {
  Bot,
  ClipboardCheck,
  DatabaseZap,
  Gauge,
  Home,
  Library,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ScreenId =
  | "home"
  | "journeys"
  | "agents"
  | "reviews"
  | "consumption"
  | "observability"
  | "admin"
  | "create-ai"
  | "start-journey"
  | "assets";

export type ScreenMeta = {
  id: ScreenId;
  label: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

export const navItems: ScreenMeta[] = [
  {
    id: "home",
    label: "Home",
    title: "Home",
    subtitle: "Command center for governed unstructured data products.",
    icon: Home,
  },
  {
    id: "journeys",
    label: "Data Journeys",
    title: "Data Journeys",
    subtitle: "Build and manage governed data products across the lifecycle.",
    icon: DatabaseZap,
  },
  {
    id: "agents",
    label: "Agent Console",
    title: "Agent Console",
    subtitle: "Monitor and orchestrate AI agents across the platform.",
    icon: Bot,
  },
  {
    id: "reviews",
    label: "Human Review Queue",
    title: "Human Review Queue",
    subtitle: "Review, validate, and approve AI-generated outputs.",
    icon: ClipboardCheck,
  },
  {
    id: "consumption",
    label: "Consumption Hub",
    title: "Consumption Hub",
    subtitle: "Discover and consume governed knowledge assets.",
    icon: Library,
  },
  {
    id: "observability",
    label: "Observability",
    title: "Observability",
    subtitle: "Monitor runs, lineage, governance, audit, alerts, and cost.",
    icon: Gauge,
  },
  {
    id: "admin",
    label: "Admin",
    title: "Admin",
    subtitle: "Configure foundations, policies, users, models, and environments.",
    icon: Settings,
  },
];

export const screenMeta: Record<ScreenId, ScreenMeta> = {
  home: navItems[0],
  journeys: navItems[1],
  agents: navItems[2],
  reviews: navItems[3],
  consumption: navItems[4],
  observability: navItems[5],
  admin: navItems[6],
  "create-ai": {
    id: "create-ai",
    label: "Create Journey with AI",
    title: "Create Journey with AI",
    subtitle: "Generate a governed journey blueprint from a business objective.",
    icon: Bot,
  },
  "start-journey": {
    id: "start-journey",
    label: "Start Data Journey",
    title: "Start Data Journey",
    subtitle: "Create a governed journey from templates, sources, or a blank canvas.",
    icon: DatabaseZap,
  },
  assets: {
    id: "assets",
    label: "Explore Assets",
    title: "Explore Assets",
    subtitle: "Browse published knowledge assets, search indexes, tables, APIs, and graphs.",
    icon: Library,
  },
};
