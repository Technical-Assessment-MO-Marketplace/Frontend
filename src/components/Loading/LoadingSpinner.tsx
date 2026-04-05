import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  variant?: "default" | "centered" | "compact" | "profile";
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  variant = "default",
  fullHeight = true,
}) => {
  if (variant === "default") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div
          className={`flex items-center justify-center ${fullHeight ? "h-96" : ""}`}
        >
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
            {message && <p className="text-gray-600">{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "centered") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Loader className="w-4 h-4 animate-spin" />
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          {message && <p className="text-gray-600 text-lg">{message}</p>}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
