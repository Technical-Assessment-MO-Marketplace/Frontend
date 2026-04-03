import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminAttributesApi } from "@/lib/api";
import { toast } from "sonner";
import { ErrorInline } from "@/components/Error";

interface AddAttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attributeId: number;
  attributeName: string;
}

const AddAttributeValueModal = ({
  isOpen,
  onClose,
  onSuccess,
  attributeId,
  attributeName,
}: AddAttributeValueModalProps) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!value.trim()) {
        setError("Attribute value is required");
        return;
      }

      await adminAttributesApi.addValue({
        attribute_id: attributeId,
        value: value.trim(),
      });

      toast.success("Attribute value added successfully!");
      setValue("");
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add attribute value";
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Add Attribute Value
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              For: <span className="font-semibold">{attributeName}</span>
            </p>
          </div>
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
              Value *
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`e.g., Red, Large, Premium`}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Adding..." : "Add Value"}
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

export default AddAttributeValueModal;
