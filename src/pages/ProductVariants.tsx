import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api";
import { Loader, ChevronLeft } from "lucide-react";

interface Variant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
  [key: string]: any;
}

const ProductVariants = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>("Product");

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
        setProductName(
          response.data.product_name || response.data.productName || "Product",
        );
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
          <span className="font-semibold">{productName}</span>
        </p>
      </div>

      {/* Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  SKU: {variant.sku}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Variant {variant.id}
                </span>
              </div>
              <p className="text-gray-600 text-sm">ID: {variant.id}</p>
            </div>

            {/* Variant Details */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Price
                </label>
                <p className="text-2xl font-bold text-green-600">
                  ${variant.price?.toFixed(2) || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">
                  Stock
                </label>
                <p
                  className={`text-lg font-semibold ${variant.stock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {variant.stock !== undefined
                    ? `${variant.stock} units`
                    : "N/A"}
                </p>
              </div>

              {variant.color && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Color
                  </label>
                  <p className="text-sm text-gray-900">{variant.color}</p>
                </div>
              )}

              {variant.size && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Size
                  </label>
                  <p className="text-sm text-gray-900">{variant.size}</p>
                </div>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="pt-4 border-t border-gray-200">
              {variant.stock > 0 ? (
                <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                  ✓ In Stock
                </span>
              ) : (
                <span className="inline-block bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                  ✗ Out of Stock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 text-sm text-gray-600">
        Showing <span className="font-semibold">{variants.length}</span> variant
        {variants.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default ProductVariants;
