import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api";
import { ChevronRight, Plus, Edit2, Trash2, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CreateProductModal from "@/components/CreateProductModal";
import EditProductModal from "@/components/EditProductModal";
import DeleteProductConfirm from "@/components/DeleteProductConfirm";
import CreateVariantModal from "@/components/CreateVariantModal";
import { LoadingSpinner } from "@/components/Loading";

interface Product {
  id: number;
  name: string;
  description: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      setProducts(response.data.products || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading products..." variant="default" />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Browse all available products</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Product
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Products
          </h2>
          <p className="text-gray-600">
            There are no products available at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Product ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Variants
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Admin Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {product.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        onClick={() =>
                          navigate(`/products/${product.id}/variants`)
                        }
                        size="sm"
                        variant="outline"
                        className="inline-flex items-center gap-1"
                      >
                        Variants
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsVariantModalOpen(true);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1"
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

          {/* Summary */}
          <div className="mt-6 text-sm text-gray-600">
            Showing <span className="font-semibold">{products.length}</span>{" "}
            product
            {products.length !== 1 ? "s" : ""}
          </div>
        </>
      )}

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProducts}
      />

      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
            onSuccess={fetchProducts}
            product={selectedProduct}
          />

          <DeleteProductConfirm
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}
            onSuccess={fetchProducts}
            product={selectedProduct}
          />

          <CreateVariantModal
            isOpen={isVariantModalOpen}
            onClose={() => {
              setIsVariantModalOpen(false);
              setSelectedProduct(null);
            }}
            onSuccess={fetchProducts}
            productId={selectedProduct.id}
            productName={selectedProduct.name}
          />
        </>
      )}
    </div>
  );
};

export default Products;
