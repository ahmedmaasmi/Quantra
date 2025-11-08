import { LucideIcon, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "primary";
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, variant = "default" }: MetricCardProps) {
  return (
    <Card className={cn(variant === "primary" && "bg-primary text-primary-foreground")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn("text-sm mb-2", variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")}>{title}</p>
            <p className={cn("text-3xl font-bold", variant === "primary" && "text-primary-foreground")}>{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className={cn("h-4 w-4", variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")} />
                <p
                  className={cn(
                    "text-sm",
                    variant === "primary" ? "text-primary-foreground/80" : changeType === "positive" && "text-success",
                    variant === "primary" ? "" : changeType === "negative" && "text-destructive",
                    variant === "primary" ? "" : changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                </p>
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", variant === "primary" ? "bg-primary-foreground/20" : "bg-primary/10")}>
            <Icon className={cn("h-6 w-6", variant === "primary" ? "text-primary-foreground" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
