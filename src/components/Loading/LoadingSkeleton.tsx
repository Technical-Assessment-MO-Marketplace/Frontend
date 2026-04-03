interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  circle?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  height = "h-4",
  circle = false,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-gray-200 rounded ${
            circle ? "rounded-full w-10" : ""
          } animate-pulse`}
        />
      ))}
    </div>
  );
};
