import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/Loading";
import { ErrorCard } from "@/components/Error";

interface Variant {
  id: number;
  product_id: number;
  combination_key: string;
  price: number;
  stock: number;
  created_at: string;
  [key: string]: any;
}

const ProductVariants = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>("Product");

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!id) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const variantResponse = await productsApi.getVariants(parseInt(id));
        const variantList =
          variantResponse.data.variants || variantResponse.data.data || [];
        setVariants(variantList);
        setProductName(
          variantResponse.data.product_name ||
            variantResponse.data.productName ||
            "Product",
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
      <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center h-96">
        <LoadingSpinner size="md" text="Loading variants..." />
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
        <ErrorCard
          message={error}
          onRetry={() => window.location.reload()}
          containerClass=""
        />
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Button
        onClick={() => navigate("/products")}
        variant="outline"
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {productName} - Variants
        </h1>
        <p className="text-gray-600 mt-2">
          Showing {variants.length} variant{variants.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Combination Key
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <tr
                key={variant.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {variant.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                  {variant.combination_key}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  ${variant.price?.toFixed(2) || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {variant.stock} units
                </td>
                <td className="px-6 py-4 text-sm">
                  {variant.stock > 0 ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      ✓ In Stock
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                      ✗ Out of Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(variant.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductVariants;
