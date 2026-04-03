interface ErrorInlineProps {
  message: string;
  className?: string;
}

export const ErrorInline: React.FC<ErrorInlineProps> = ({
  message,
  className = "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
}) => {
  return <div className={className}>{message}</div>;
};
