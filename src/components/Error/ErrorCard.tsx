import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  containerClass?: string;
  fullWidth?: boolean;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message,
  title = "Error",
  onRetry,
  containerClass = "max-w-6xl mx-auto px-4 py-12",
  fullWidth = false,
}) => {
  return (
    <div className={containerClass}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};
