import React from 'react';
import { StorefrontShell } from '@/components/StorefrontShell';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
