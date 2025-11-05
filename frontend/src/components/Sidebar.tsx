"use client";
import { LayoutDashboard, Shield, AlertTriangle, FolderOpen, TrendingUp, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "KYC Verification", icon: Shield, path: "/kyc" },
  { title: "Fraud Detection", icon: AlertTriangle, path: "/fraud" },
  { title: "AML Cases", icon: FolderOpen, path: "/aml" },
  { title: "Credit Forecast", icon: TrendingUp, path: "/forecast" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-6 border-b border-sidebar-border flex items-center gap-3 relative",
        isCollapsed && "justify-center p-4"
      )}>
        {!isCollapsed && (
          <>
            <div className="relative w-10 h-10 flex-shrink-0">
              <img src="/logo.svg" alt="Quantra Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-primary truncate">Quantra</h1>
              <p className="text-xs text-muted-foreground mt-1 truncate">Enterprise Risk Platform</p>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="relative w-10 h-10">
            <img src="/logo.svg" alt="Quantra Logo" className="w-full h-full object-contain" />
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "p-1 rounded-md hover:bg-sidebar-accent transition-colors",
              isCollapsed ? "absolute top-2 right-2" : "ml-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center px-3"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className={cn(
          "flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
          isCollapsed && "justify-center px-3"
        )} title={isCollapsed ? "AI Assistant" : undefined}>
          <MessageSquare className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium">AI Assistant</span>
          )}
        </button>
      </div>
    </aside>
  );
}
