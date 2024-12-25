"use client";

import dynamic from 'next/dynamic';

const ClientProviders = dynamic(
  () => import('./client-providers'),
  { ssr: false }
);

export function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
} 