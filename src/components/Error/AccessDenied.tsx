interface AccessDeniedProps {
  containerClass?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  containerClass = "max-w-6xl mx-auto px-4 py-12",
}) => {
  return (
    <div className={containerClass}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-700">
        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
        <p>Only administrators can access this page.</p>
      </div>
    </div>
  );
};
