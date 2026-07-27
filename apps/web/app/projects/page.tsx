import type { Metadata } from "next";
import { ProjectsPage } from "@/src/screens/projects-page";

export const metadata: Metadata = { title: "Knowledge Projects" };
export default function Page() { return <ProjectsPage />; }
