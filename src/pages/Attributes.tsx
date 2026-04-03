import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminAttributesApi } from "@/lib/api";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { LoadingSpinner } from "@/components/Loading";
import { ErrorCard, AccessDenied } from "@/components/Error";
import { useAuth } from "@/contexts/AuthContext";
import CreateAttributeModal from "@/components/CreateAttributeModal";
import AddAttributeValueModal from "@/components/AddAttributeValueModal";
import { toast } from "sonner";

interface AttributeValue {
  id: number;
  value: string;
}

interface Attribute {
  id: number;
  name: string;
}

const Attributes = () => {
  const { isAdmin } = useAuth();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<{
    [key: number]: AttributeValue[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingValuesId, setLoadingValuesId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null,
  );
  const [deletingValueId, setDeletingValueId] = useState<number | null>(null);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await adminAttributesApi.getAll();
      setAttributes(response.data.attributes || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load attributes";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attributeId: number) => {
    if (!window.confirm("Are you sure you want to delete this attribute?")) {
      return;
    }

    setDeletingId(attributeId);
    try {
      await adminAttributesApi.delete(attributeId);
      toast.success("Attribute deleted successfully!");
      fetchAttributes();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete attribute";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = async (attribute: Attribute) => {
    if (expandedId === attribute.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(attribute.id);
    if (!attributeValues[attribute.id]) {
      await fetchValues(attribute);
    }
  };

  const fetchValues = async (attribute: Attribute) => {
    setLoadingValuesId(attribute.id);
    try {
      const response = await adminAttributesApi.getValues(attribute.id);
      setAttributeValues((prev) => ({
        ...prev,
        [attribute.id]: response.data.values || [],
      }));
    } catch (err: any) {
      toast.error("Failed to load attribute values");
    } finally {
      setLoadingValuesId(null);
    }
  };

  const handleDeleteValue = async (valueId: number, attributeId: number) => {
    if (!window.confirm("Are you sure you want to delete this value?")) {
      return;
    }

    setDeletingValueId(valueId);
    try {
      await adminAttributesApi.deleteValue(valueId);
      toast.success("Attribute value deleted successfully!");
      // Refresh the values for this specific attribute
      const response = await adminAttributesApi.getValues(attributeId);
      setAttributeValues((prev) => ({
        ...prev,
        [attributeId]: response.data.values || [],
      }));
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete attribute value";
      toast.error(errorMessage);
    } finally {
      setDeletingValueId(null);
    }
  };

  if (!isAdmin) {
    return <AccessDenied />;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center h-96">
        <LoadingSpinner size="md" text="Loading attributes..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
          <p className="text-gray-600 mt-2">
            Manage product attributes like Color, Size, Brand, etc.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Attribute
        </Button>
      </div>

      {/* Attributes Grid */}
      {attributes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Attributes
          </h2>
          <p className="text-gray-600">
            Create your first attribute to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleExpand(attribute)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {attribute.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {expandedId === attribute.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(attribute.id);
                    }}
                    disabled={deletingId === attribute.id}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === attribute.id && (
                <div className="p-4 border-t border-gray-200">
                  <div className="mb-4">
                    <Button
                      onClick={() => {
                        setSelectedAttribute(attribute);
                        setIsValueModalOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2 mb-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Value
                    </Button>
                  </div>

                  {loadingValuesId === attribute.id ? (
                    <div className="py-4">
                      <LoadingSpinner size="sm" text="Loading values..." />
                    </div>
                  ) : (attributeValues[attribute.id] || []).length === 0 ? (
                    <div className="bg-gray-50 rounded p-4 text-center text-gray-600 text-sm">
                      No values added yet. Click "Add Value" to create one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(attributeValues[attribute.id] || []).map((value) => (
                        <div
                          key={value.id}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <span className="text-gray-900 font-medium">
                            {value.value}
                          </span>
                          <Button
                            onClick={() =>
                              handleDeleteValue(value.id, attribute.id)
                            }
                            disabled={deletingValueId === value.id}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 text-sm text-gray-600">
        Showing <span className="font-semibold">{attributes.length}</span>{" "}
        attribute{attributes.length !== 1 ? "s" : ""}
      </div>

      <CreateAttributeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAttributes}
      />

      {selectedAttribute && (
        <AddAttributeValueModal
          isOpen={isValueModalOpen}
          onClose={() => {
            setIsValueModalOpen(false);
            setSelectedAttribute(null);
          }}
          onSuccess={() => fetchValues(selectedAttribute)}
          attributeId={selectedAttribute.id}
          attributeName={selectedAttribute.name}
        />
      )}
    </div>
  );
};

export default Attributes;
