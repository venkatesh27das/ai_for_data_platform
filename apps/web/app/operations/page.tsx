import type { Metadata } from "next";
import { OperationsPage } from "@/src/screens/operations-page";

export const metadata: Metadata = { title: "Operations" };
export default function Page() { return <OperationsPage />; }
