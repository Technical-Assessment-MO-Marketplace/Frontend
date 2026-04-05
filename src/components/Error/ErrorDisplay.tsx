import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  variant?: "default" | "card" | "profile" | "inline";
  onRetry?: () => void;
  onBack?: () => void;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  variant = "default",
  onRetry,
  onBack,
  title = "Error",
}) => {
  if (variant === "default") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-6 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Button>
        )}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <span className="text-red-600 text-2xl font-bold">⚠️</span>
            </div>
          </div>
          <p className="text-red-600 mb-6 text-lg font-semibold">{title}</p>
          <p className="text-gray-600 mb-4">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-semibold"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="text-red-800">{message}</span>
      </div>
    );
  }

  return null;
};

export default ErrorDisplay;
