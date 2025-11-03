import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search transactions, users, cases..."
          className="bg-secondary border-0"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
            3
          </Badge>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Risk Analyst</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
