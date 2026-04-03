import { Loader } from "lucide-react";

interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = "Loading...",
  fullScreen = false,
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-black bg-opacity-50"
    : "absolute inset-0 bg-white bg-opacity-70";

  return (
    <div
      className={`${containerClasses} flex items-center justify-center z-50`}
    >
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-700 font-medium">{text}</p>
        </div>
      </div>
    </div>
  );
};
