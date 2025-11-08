"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Settings, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/api";

export function TopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const alerts = await apiClient.getAlerts();
        const unreadAlerts = alerts.filter((a: any) => !a.isRead);
        setNotifications(alerts.slice(0, 10));
        setUnreadCount(unreadAlerts.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // Ignore
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      // Search across users, transactions, and cases
      const [users, transactions, cases] = await Promise.all([
        apiClient.getUsers().catch(() => []),
        apiClient.getTransactions().catch(() => []),
        apiClient.getCases().catch(() => []),
      ]);

      const query = searchQuery.toLowerCase();
      const userResults = users.filter((u: any) =>
        u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
      );
      const transactionResults = transactions.filter((t: any) =>
        t.id.toLowerCase().includes(query) || t.merchant?.toLowerCase().includes(query)
      );
      const caseResults = cases.filter((c: any) =>
        c.id.toLowerCase().includes(query) || c.summary?.toLowerCase().includes(query)
      );

      console.log("Search results:", { userResults, transactionResults, caseResults });
      // You can implement a search results modal/page here
      alert(`Found ${userResults.length} users, ${transactionResults.length} transactions, ${caseResults.length} cases`);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const markNotificationAsRead = async (alertId: string) => {
    try {
      await apiClient.updateAlert(alertId, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === alertId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/hero");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search task"
          className="bg-background border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="text-xs text-muted-foreground hidden sm:inline">⌘F</span>
      </form>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <p className="font-semibold mb-2">Notifications</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-secondary ${
                        !notification.isRead ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "Risk Analyst"}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
