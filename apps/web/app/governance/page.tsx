import type { Metadata } from "next";
import { GovernancePage } from "@/src/screens/governance-page";

export const metadata: Metadata = { title: "Governance" };
export default function Page() { return <GovernancePage />; }
