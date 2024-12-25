"use client";

import { ThemeProvider } from "next-themes";
import { ToasterProvider } from "./toaster-provider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <ToasterProvider />
    </>
  );
} 