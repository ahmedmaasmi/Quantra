"use client";
import { LayoutDashboard, Shield, AlertTriangle, FolderOpen, TrendingUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "KYC Verification", icon: Shield, path: "/kyc" },
  { title: "Fraud Detection", icon: AlertTriangle, path: "/fraud" },
  { title: "AML Cases", icon: FolderOpen, path: "/aml" },
  { title: "Credit Forecast", icon: TrendingUp, path: "/forecast" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-primary">FinSecure</h1>
        <p className="text-xs text-muted-foreground mt-1">Enterprise Risk Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">AI Assistant</span>
        </button>
      </div>
    </aside>
  );
}
