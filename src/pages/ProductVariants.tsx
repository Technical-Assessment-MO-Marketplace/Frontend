import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productsApi, adminProductsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader, ChevronLeft, Edit2, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Variant {
  id: number;
  product_id: number;
  attributes: string;
  price: number;
  stock: number;
  created_at?: string;
  [key: string]: any;
}

const ProductVariants = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [newStock, setNewStock] = useState<string>("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!id) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productsApi.getVariants(parseInt(id));
        setVariants(response.data.variants || response.data.data || []);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load variants";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [id]);

  const handleUpdateStock = async () => {
    if (!selectedVariant || !id) return;

    if (!newStock.trim()) {
      toast.error("Please enter a stock value");
      return;
    }

    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock value");
      return;
    }

    setIsUpdating(true);
    try {
      await adminProductsApi.updateVariant(parseInt(id), selectedVariant.id, {
        stock: stockValue,
      });
      toast.success("Stock updated successfully!");
      setIsUpdateModalOpen(false);
      setNewStock("");
      setSelectedVariant(null);

      // Refresh variants
      const response = await productsApi.getVariants(parseInt(id));
      setVariants(response.data.variants || response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update stock";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteVariant = async (variant: Variant) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    if (!id) return;

    setIsDeleting(true);
    try {
      await adminProductsApi.deleteVariant(parseInt(id), variant.id);
      toast.success("Variant deleted successfully!");

      // Refresh variants
      const response = await productsApi.getVariants(parseInt(id));
      setVariants(response.data.variants || response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete variant";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateClick = (variant: Variant) => {
    setSelectedVariant(variant);
    setNewStock(variant.stock.toString());
    setIsUpdateModalOpen(true);
  };

  const handleOrderVariant = (variant: Variant) => {
    if (!isAuthenticated) {
      toast.error("You have to logged in to the system");
      navigate("/login");
      return;
    }
    if (variant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }
    // Navigate to checkout page with variant data
    navigate("/checkout", { state: { variant, productId: id } });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading variants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Button
          onClick={() => navigate("/products")}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Button
          onClick={() => navigate("/products")}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Variants
          </h2>
          <p className="text-gray-600">
            There are no variants available for this product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Button
        onClick={() => navigate("/products")}
        variant="outline"
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Variants</h1>
        <p className="text-gray-600 mt-2">
          Available variants for{" "}
          <span className="font-semibold">Product #{id}</span>
        </p>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Variant ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Attributes
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Stock
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                Status
              </th>
              {isAuthenticated && (
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Order
                </th>
              )}
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  #{variant.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {variant.attributes}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  ${variant.price?.toFixed(2) || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span
                    className={
                      variant.stock > 0
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {variant.stock ?? "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {variant.stock > 0 ? (
                    <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      ✓ In Stock
                    </span>
                  ) : (
                    <span className="inline-block bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                      ✗ Out of Stock
                    </span>
                  )}
                </td>
                {isAuthenticated && (
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleOrderVariant(variant)}
                      disabled={variant.stock <= 0}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order
                    </Button>
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => handleUpdateClick(variant)}
                          disabled={isUpdating}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteVariant(variant)}
                          disabled={isDeleting}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-8 text-sm text-gray-600">
        Showing <span className="font-semibold">{variants.length}</span> variant
        {variants.length !== 1 ? "s" : ""}
      </div>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Update Stock
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Variant ID: {selectedVariant.id} ({selectedVariant.attributes})
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Value
              </label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter stock quantity"
                min="0"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setNewStock("");
                  setSelectedVariant(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;
