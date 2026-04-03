import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminProductsApi, adminAttributesApi } from "@/lib/api";
import { toast } from "sonner";

interface AttributeValue {
  id: number;
  value: string;
}

interface Attribute {
  id: number;
  name: string;
  values?: AttributeValue[];
}

interface CreateVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: number | null;
  productName?: string;
}

const CreateVariantModal = ({
  isOpen,
  onClose,
  onSuccess,
  productId,
  productName,
}: CreateVariantModalProps) => {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [key: number]: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAttributes();
    }
  }, [isOpen]);

  const fetchAttributes = async () => {
    setLoadingAttributes(true);
    try {
      const response = await adminAttributesApi.getAll();
      const attrs: Attribute[] = response.data.attributes || [];

      // Fetch values for each attribute
      const attrsWithValues = await Promise.all(
        attrs.map(async (attr) => {
          try {
            const valuesResponse = await adminAttributesApi.getValues(attr.id);
            return {
              ...attr,
              values: valuesResponse.data.values || [],
            };
          } catch {
            return { ...attr, values: [] };
          }
        }),
      );

      setAttributes(attrsWithValues);
    } catch (err: any) {
      toast.error("Failed to load attributes");
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!productId) {
        setError("No product selected");
        return;
      }

      if (!price.trim() || isNaN(Number(price))) {
        setError("Valid price is required");
        return;
      }

      if (!stock.trim() || isNaN(Number(stock))) {
        setError("Valid stock quantity is required");
        return;
      }

      // Convert selected values to attributeValueIds
      const attributeValueIds = Object.values(selectedValues).filter(
        (id) => id !== 0,
      );

      const payload = {
        product_id: productId,
        price: parseFloat(price),
        stock: parseInt(stock),
        attributeValueIds,
      };

      await adminProductsApi.createVariant(payload);

      toast.success("Variant created successfully!");
      setPrice("");
      setStock("");
      setSelectedValues({});
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create variant";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeValueChange = (attributeId: number, valueId: number) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Variant</h2>
            {productName && (
              <p className="text-sm text-gray-600 mt-1">For: {productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 999.99"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
              required
            />
          </div>

          {/* Attributes Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Attributes (Optional)
            </h3>
            {loadingAttributes ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                Loading attributes...
              </div>
            ) : attributes.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded p-2">
                No attributes available. Create attributes first.
              </div>
            ) : (
              <div className="space-y-3">
                {attributes.map((attribute) => (
                  <div key={attribute.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {attribute.name}
                    </label>
                    <select
                      value={selectedValues[attribute.id] || 0}
                      onChange={(e) =>
                        handleAttributeValueChange(
                          attribute.id,
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select {attribute.name}</option>
                      {(attribute.values || []).map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Variant"}
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

export default CreateVariantModal;
