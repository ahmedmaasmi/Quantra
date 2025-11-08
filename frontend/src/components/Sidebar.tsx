"use client";
import { LayoutDashboard, Shield, AlertTriangle, FolderOpen, TrendingUp, MessageSquare, ChevronLeft, ChevronRight, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "KYC Verification", icon: Shield, path: "/kyc", badge: null },
  { title: "Fraud Detection", icon: AlertTriangle, path: "/fraud" },
  { title: "AML Cases", icon: FolderOpen, path: "/aml" },
  { title: "Credit Forecast", icon: TrendingUp, path: "/forecast" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onOpenChatbot?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle, onOpenChatbot }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/hero");
  };

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
              <Image
                src="/logo.svg"
                alt="Quantra Logo"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">Quantra</h1>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="relative w-10 h-10">
            <Image
              src="/logo.svg"
              alt="Quantra Logo"
              width={40}
              height={40}
              className="w-full h-full"
            />
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

      <nav className="flex-1 p-4 space-y-4">
        {!isCollapsed && (
          <div className="px-2 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
          </div>
        )}
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path || (item.path === "/dashboard" && pathname === "/");
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link
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
                  <>
                    <span className="font-medium flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                    )}
                  </>
                )}
              </Link>
              </motion.div>
            );
          })}
        </div>

        {!isCollapsed && (
          <>
            <div className="px-2 mt-6 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</p>
            </div>
            <div className="space-y-2">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors",
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href="/help"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors",
                  pathname === "/help"
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Help</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={() => onOpenChatbot?.()}
          className={cn(
            "flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            isCollapsed && "justify-center px-3"
          )} 
          title={isCollapsed ? "AI Assistant" : undefined}
        >
          <MessageSquare className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium">AI Assistant</span>
          )}
        </button>
      </div>
    </aside>
  );
}
