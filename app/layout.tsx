// app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/app/globals.css";
import { ShellVariantProvider } from "@/components/shell-variant-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ADXC",
  description: "Premium data. Pay as you go.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <TooltipProvider delayDuration={300}>
          {/*
          ShellVariantProvider renders the floating DEV toggle
          only when NODE_ENV === 'development'. Zero cost in production.
        */}
          <ShellVariantProvider defaultVariant="admin">
            {children}
          </ShellVariantProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}