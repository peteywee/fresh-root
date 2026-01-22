import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  icon?: React.ElementType;
  color?: "default" | "blue" | "amber" | "rose" | "green";
}

export function StatCard({
  title,
  value,
  trend,
  trendValue,
  description,
  icon: Icon,
  color = "default",
}: StatCardProps) {
  const colorMap = {
    default: "text-primary",
    blue: "text-schedule-blue",
    amber: "text-schedule-amber",
    rose: "text-schedule-rose",
    green: "text-schedule-green",
  };

  const activeColor = colorMap[color];

  return (
    <Card
      variant="solid"
      className="bg-card border-border/40 shadow-sm hover:border-border transition-colors"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-4 w-4", activeColor)} />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-heading font-bold text-foreground">{value}</div>
        {(trend || description) && (
          <div className="flex items-center mt-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "flex items-center font-medium mr-2 px-1.5 py-0.5 rounded-sm bg-opacity-10",
                  trend === "up"
                    ? "text-schedule-green bg-schedule-green/10"
                    : trend === "down"
                      ? "text-schedule-rose bg-schedule-rose/10"
                      : "text-muted-foreground bg-muted",
                )}
              >
                {trend === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                {trend === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate" title={description}>
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
