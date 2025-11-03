"use client";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Chatbot } from "./Chatbot";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
