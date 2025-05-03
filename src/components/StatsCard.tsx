
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  iconClassName?: string;
  isLoading?: boolean;
}

const StatsCard = ({
  icon: Icon,
  title,
  value,
  iconClassName,
  isLoading = false,
}: StatsCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10",
              iconClassName
            )}
          >
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-7 w-20 animate-pulse rounded bg-muted"></div>
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
