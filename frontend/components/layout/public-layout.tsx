"use client";

import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}
