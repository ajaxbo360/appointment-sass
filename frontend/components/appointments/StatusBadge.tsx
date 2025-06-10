import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Calendar } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return {
          label: "Scheduled",
          variant: "secondary" as const,
          icon: <Clock className="h-3 w-3" />,
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          variant: "default" as const,
          icon: <Calendar className="h-3 w-3" />,
          className:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200",
        };
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          icon: <CheckCircle className="h-3 w-3" />,
          className:
            "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          icon: <XCircle className="h-3 w-3" />,
          className:
            "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200",
        };
      default:
        return {
          label: status || "Unknown",
          variant: "outline" as const,
          icon: <Clock className="h-3 w-3" />,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${config.className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
