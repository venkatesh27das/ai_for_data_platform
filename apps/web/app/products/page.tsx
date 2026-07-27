import type { Metadata } from "next";
import { ProductsPage } from "@/src/screens/products-page";

export const metadata: Metadata = { title: "Knowledge Products" };
export default function Page() { return <ProductsPage />; }
