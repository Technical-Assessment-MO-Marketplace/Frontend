import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader, ChevronDown, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    description: string;
  };
  variant: {
    id: number;
    combination_key: string;
    price: number;
    stock: number;
  };
}

interface Order {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/home");
      return;
    }

    fetchOrders();
  }, [isAdmin, isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      setOrders(response.data.data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === statusFilter.toLowerCase(),
        );

  const uniqueStatuses = [...new Set(orders.map((order) => order.status))];

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">
          Manage and view all customer orders and their details
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          Filter by status:
        </span>
        <Button
          onClick={() => setStatusFilter("all")}
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
        >
          All ({orders.length})
        </Button>
        {uniqueStatuses.map((status) => (
          <Button
            key={status}
            onClick={() => setStatusFilter(status)}
            variant={
              statusFilter.toLowerCase() === status.toLowerCase()
                ? "default"
                : "outline"
            }
            size="sm"
          >
            {status} (
            {
              orders.filter(
                (o) => o.status.toLowerCase() === status.toLowerCase(),
              ).length
            }
            )
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-20">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-40">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-28">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-24">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-40">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-20">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-28">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-semibold text-blue-600 w-20">
                        #{order.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-32 truncate">
                        {order.user.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 w-40 truncate">
                        {order.user.email}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 w-28">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm w-24">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 w-40">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 w-20 text-center">
                        {order.items.length}
                      </td>
                      <td className="px-4 py-4 text-sm w-28">
                        <button
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id,
                            )
                          }
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          {expandedOrderId === order.id ? "Hide" : "View"}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedOrderId === order.id ? "rotate-180" : ""}`}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Order Details */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-blue-50 border-b border-gray-200">
                        <td colSpan={8} className="px-4 py-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                                  Order ID
                                </p>
                                <p className="text-sm text-gray-900">
                                  #{order.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                                  Status
                                </p>
                                <p className="text-sm">
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                                  >
                                    {order.status}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Order Items
                              </h4>
                              <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
                                {order.items.map((item, index) => (
                                  <div
                                    key={item.id}
                                    className="pb-3 border-b last:border-b-0 last:pb-0"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                          {index + 1}. {item.product.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {item.product.description}
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        $
                                        {(item.price * item.quantity).toFixed(
                                          2,
                                        )}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          Variant
                                        </p>
                                        <p>{item.variant.combination_key}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          Quantity
                                        </p>
                                        <p>{item.quantity}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          Unit Price
                                        </p>
                                        <p>${item.price.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-700">
                                          Stock
                                        </p>
                                        <p>{item.variant.stock}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                              <p className="text-sm font-semibold text-gray-900">
                                Total Amount
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                ${order.total_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
