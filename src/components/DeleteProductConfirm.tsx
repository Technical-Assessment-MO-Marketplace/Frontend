import { Button } from "@/components/ui/button";
import { adminProductsApi } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteProductConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: { id: number; name: string } | null;
}

const DeleteProductConfirm = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}: DeleteProductConfirmProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      await adminProductsApi.delete(product.id);
      toast.success("Product deleted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete product";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Delete Product
        </h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{product.name}</strong>? This
          action cannot be undone.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
          <Button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductConfirm;
