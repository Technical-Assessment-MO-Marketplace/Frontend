import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { ErrorInline } from "@/components/Error";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAdminModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdminModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      const response = await authApi.createAdmin({ email, password });

      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success("Admin created successfully");
      }

      setEmail("");
      setPassword("");
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create admin";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Admin User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorInline message={error} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Admin"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal;
