import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/src/components/app-shell";
import { Providers } from "@/src/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Knowledge Builder",
    template: "%s · Knowledge Builder",
  },
  description:
    "Define, build, validate, govern and operate trusted enterprise knowledge products.",
  openGraph: {
    title: "Knowledge Builder",
    description: "Trusted enterprise context for AI",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Builder",
    description: "Trusted enterprise context for AI",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
