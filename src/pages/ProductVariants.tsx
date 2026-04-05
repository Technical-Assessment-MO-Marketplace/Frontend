import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productsApi, adminProductsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Edit2, Trash2, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/Loading";
import { ErrorDisplay } from "@/components/Error";
import type {
  Variant,
  AttributeValue,
  Attribute,
  VariantAttribute,
} from "@/types";

const ProductVariants = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [allVariants, setAllVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [newStock, setNewStock] = useState<string>("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<{
    [key: number]: number | null;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch variants
        const variantsResponse = await productsApi.getVariants(parseInt(id));
        const variantsList =
          variantsResponse.data.variants || variantsResponse.data.data || [];

        // Normalize variants to ensure attributes are arrays
        const normalizedList = variantsList.map(normalizeVariant);
        setVariants(normalizedList);
        setAllVariants(normalizedList);

        // Fetch attributes
        try {
          const attributesResponse = await productsApi.getProductAttributes(
            parseInt(id),
          );
          const attributesList =
            attributesResponse.data.attributes ||
            attributesResponse.data.data ||
            [];
          setAttributes(attributesList);
        } catch (attrErr) {
          console.log("Attributes not available");
        }
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load variants";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      toast.error("First logged in to the system. Cannot go order page");
      return;
    }
    if (variant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }
    // Validate variant has required properties
    if (!variant.id || variant.price === undefined) {
      toast.error("Invalid variant data. Please refresh and try again.");
      console.error("Variant missing required properties:", variant);
      return;
    }
    // Navigate to checkout page with variant data
    navigate("/checkout", { state: { variant, productId: id } });
  };

  const normalizeVariant = (variant: any): Variant => {
    // Safely handle attributes - convert to array if needed
    let normalizedAttributes: any = [];

    if (variant.attributes) {
      if (Array.isArray(variant.attributes)) {
        normalizedAttributes = variant.attributes;
      } else if (typeof variant.attributes === "string") {
        // If it's a JSON string, try to parse it
        try {
          const parsed = JSON.parse(variant.attributes);
          normalizedAttributes = Array.isArray(parsed) ? parsed : [];
        } catch {
          normalizedAttributes = variant.attributes;
        }
      } else if (typeof variant.attributes === "object") {
        // If it's a single object, wrap it in an array
        normalizedAttributes = [variant.attributes];
      }
    }

    return {
      id: variant.id || variant.variant_id,
      product_id: variant.product_id || parseInt(id || "0"),
      attributes: normalizedAttributes,
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
      created_at: variant.created_at,
    };
  };

  const handleFilterVariants = async () => {
    if (!id) return;

    const selectedValues = Object.values(selectedAttributeValues).filter(
      (v) => v !== null,
    ) as number[];

    if (selectedValues.length === 0) {
      setVariants(allVariants);
      toast.info("All filters cleared");
      return;
    }

    setFilterLoading(true);
    try {
      const response = await productsApi.filterVariants(
        parseInt(id),
        selectedValues,
      );
      const filteredVariants =
        response.data.variants || response.data.data || [];

      // Normalize filtered variants to ensure they have required properties
      const normalizedVariants = filteredVariants.map(normalizeVariant);
      setVariants(normalizedVariants);

      if (normalizedVariants.length === 0) {
        toast.info("No variants found with selected attributes");
      } else {
        toast.success(`Found ${normalizedVariants.length} variant(s)`);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to filter variants";
      toast.error(errorMessage);
      console.error("Filter error:", err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedAttributeValues({});
    setVariants(allVariants);
    toast.info("Filters cleared");
  };

  const hasActiveFilters = Object.values(selectedAttributeValues).some(
    (v) => v !== null,
  );

  const toggleAttributeValue = (attributeId: number, valueId: number) => {
    setSelectedAttributeValues((prev) => {
      const current = prev[attributeId];
      return {
        ...prev,
        [attributeId]: current === valueId ? null : valueId,
      };
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading variants..." variant="default" />;
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        variant="card"
        onRetry={() => window.location.reload()}
        onBack={() => navigate("/products")}
      />
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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-4 py-6 sm:py-8 md:py-12">
      <Button
        onClick={() => navigate("/products")}
        variant="outline"
        className="mb-6 flex items-center gap-2 text-xs sm:text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Button>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Product Variants
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Available variants for{" "}
          <span className="font-semibold">Product #{id}</span>
        </p>
      </div>

      {/* Filter Section */}
      {attributes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Variants by Attributes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {attributes.map((attribute) => (
              <div key={attribute.attribute_id}>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3">
                  Select {attribute.attribute_name}:
                </label>
                <div className="space-y-2 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                  {attribute.values && attribute.values.length > 0 ? (
                    attribute.values.map((value) => (
                      <label
                        key={value.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition text-sm"
                      >
                        <input
                          type="radio"
                          name={`attribute-${attribute.attribute_id}`}
                          checked={
                            selectedAttributeValues[attribute.attribute_id] ===
                            value.id
                          }
                          onChange={() =>
                            toggleAttributeValue(
                              attribute.attribute_id,
                              value.id,
                            )
                          }
                          className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">
                          {value.value}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      No values available
                    </p>
                  )}
                </div>
                {selectedAttributeValues[attribute.attribute_id] && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(() => {
                      const valueId =
                        selectedAttributeValues[attribute.attribute_id];
                      const value = attribute.values?.find(
                        (v) => v.id === valueId,
                      );
                      return value ? (
                        <span
                          key={valueId}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {value.value}
                          <button
                            onClick={() =>
                              toggleAttributeValue(
                                attribute.attribute_id,
                                valueId,
                              )
                            }
                            className="ml-1 hover:text-blue-600"
                          >
                            ✕
                          </button>
                        </span>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleFilterVariants}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              disabled={filterLoading}
            >
              {filterLoading ? "Filtering..." : "Search"}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Variants Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">
                Variant ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">
                Attributes
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">
                Stock
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900">
                Order
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-xs font-medium text-gray-900">
                  #{variant.id}
                </td>
                <td className="px-6 py-4 text-xs text-gray-900">
                  {variant.attributes &&
                  Array.isArray(variant.attributes) &&
                  variant.attributes.length > 0 ? (
                    <div className="space-y-1">
                      {variant.attributes.map(
                        (attr: VariantAttribute | any, idx: number) => {
                          const attrName =
                            typeof attr === "object"
                              ? attr.attribute_name
                              : null;
                          const attrValue =
                            typeof attr === "object"
                              ? attr.attribute_value
                              : null;

                          if (!attrName || !attrValue) {
                            return null;
                          }

                          return (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold text-gray-700">
                                {attrName}:
                              </span>{" "}
                              <span className="text-gray-600">{attrValue}</span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">No attributes</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-green-600">
                  ${variant.price?.toFixed(2) || "N/A"}
                </td>
                <td className="px-6 py-4 text-xs text-gray-900">
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
                <td className="px-6 py-4 text-center">
                  <Button
                    onClick={() => handleOrderVariant(variant)}
                    disabled={variant.stock <= 0}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1 text-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Order
                  </Button>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button
                        onClick={() => handleUpdateClick(variant)}
                        disabled={isUpdating}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteVariant(variant)}
                        disabled={isDeleting}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Variants Card View */}
      <div className="md:hidden space-y-4">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="bg-white rounded-lg shadow p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs text-gray-500">Variant #{variant.id}</p>
              {variant.stock > 0 ? (
                <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                  ✓ In Stock
                </span>
              ) : (
                <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                  ✗ Out of Stock
                </span>
              )}
            </div>

            {/* Attributes */}
            {variant.attributes &&
            Array.isArray(variant.attributes) &&
            variant.attributes.length > 0 ? (
              <div className="mb-3 space-y-1">
                {variant.attributes.map(
                  (attr: VariantAttribute | any, idx: number) => {
                    const attrName =
                      typeof attr === "object" ? attr.attribute_name : null;
                    const attrValue =
                      typeof attr === "object" ? attr.attribute_value : null;

                    if (!attrName || !attrValue) {
                      return null;
                    }

                    return (
                      <div key={idx} className="text-xs">
                        <span className="font-semibold text-gray-700">
                          {attrName}:
                        </span>{" "}
                        <span className="text-gray-600">{attrValue}</span>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-3">No attributes</p>
            )}

            {/* Price and Stock Info */}
            <div className="bg-gray-50 p-3 rounded mb-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">
                  ${variant.price?.toFixed(2) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span
                  className={
                    variant.stock > 0
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {variant.stock ?? "N/A"} units
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => handleOrderVariant(variant)}
                disabled={variant.stock <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white inline-flex items-center justify-center gap-2 text-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                Order Now
              </Button>

              {isAdmin && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleUpdateClick(variant)}
                    disabled={isUpdating}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteVariant(variant)}
                    disabled={isDeleting}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600">
        Showing <span className="font-semibold">{variants.length}</span> variant
        {variants.length !== 1 ? "s" : ""}
      </div>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-sm w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Update Stock
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Variant ID: {selectedVariant.id}
            </p>

            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                New Stock Value
              </label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter stock quantity"
                min="0"
                className="text-xs sm:text-sm"
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
                className="flex-1 text-xs sm:text-sm"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
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
