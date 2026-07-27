import type { Metadata } from "next";
import { AssetsPage } from "@/src/screens/assets-page";

export const metadata: Metadata = { title: "Enterprise Assets" };
export default function Page() { return <AssetsPage />; }
