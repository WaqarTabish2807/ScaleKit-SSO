import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardInfoProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function CardInfo({ label, value, className }: CardInfoProps) {
  return (
    <div className={cn("bg-gray-50 p-4 rounded-md", className)}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      {typeof value === "string" ? (
        <p className="font-medium">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

export function StatusCardInfo({
  label,
  value,
  status = "active",
}: CardInfoProps & { status?: "active" | "inactive" | "pending" | "success" | "default" }) {
  const statusColor = {
    active: "bg-green-500",
    inactive: "bg-red-500",
    pending: "bg-yellow-500",
    success: "bg-blue-500",
    default: "bg-gray-500",
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center">
        <span className={`inline-block w-2 h-2 ${statusColor[status]} rounded-full mr-2`}></span>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

export function CodeCardInfo({
  label,
  value,
  onCopy,
}: CardInfoProps & { onCopy?: () => void }) {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        {onCopy && (
          <button
            onClick={onCopy}
            className="text-primary hover:text-primary-dark text-sm"
            aria-label="Copy to clipboard"
          >
            <span className="material-icons text-sm align-text-top">content_copy</span> Copy
          </button>
        )}
      </div>
      <div className="bg-gray-100 p-3 rounded-md overflow-x-auto">
        <code className="text-xs break-all">{value}</code>
      </div>
    </div>
  );
}
