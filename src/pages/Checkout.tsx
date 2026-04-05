import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ChevronLeft, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/Loading";

interface Variant {
  id: number;
  product_id: number;
  attributes: string;
  price: number;
  stock: number;
  created_at?: string;
  [key: string]: any;
}

interface CheckoutState {
  variant: Variant;
  productId: string;
}

interface OrderResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    user_id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items: Array<{
      id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      quantity: number;
      price: number;
      created_at: string;
    }>;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardEmail, setCardEmail] = useState("");
  const [cardPhone, setCardPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  useEffect(() => {
    const state = location.state as CheckoutState | null;
    if (!state?.variant || !state?.productId) {
      toast.error("Invalid order data");
      navigate("/products");
      return;
    }
    setVariant(state.variant);
    setProductId(state.productId);
  }, [location, navigate]);

  if (!variant) {
    return <LoadingSpinner message="Loading checkout..." variant="default" />;
  }

  const totalPrice = variant.price * quantity;

  const handleCODOrder = async () => {
    if (!cardName.trim() || !cardEmail.trim() || !cardPhone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await ordersApi.create({
        items: [
          {
            product_id: parseInt(productId || "0"),
            variant_id: variant.id,
            quantity: quantity,
          },
        ],
      });

      const orderData: OrderResponse = response.data;

      toast.success(
        `Order #${orderData.data.id} placed successfully! Total: $${orderData.data.total_amount.toFixed(2)}`,
      );

      // Store order details and navigate to confirmation
      navigate("/home", {
        state: {
          orderId: orderData.data.id,
          orderStatus: "confirmed",
        },
      });
    } catch (err: any) {
      const errorMessage =
        err?.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCardPayment = async () => {
    // Validate card details
    if (!cardName.trim() || !cardEmail.trim() || !cardPhone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!cardNumber.trim() || cardNumber.length < 13) {
      toast.error("Please enter a valid card number");
      return;
    }

    if (!cardExpiry.trim() || !cardExpiry.includes("/")) {
      toast.error("Please enter expiry in MM/YY format");
      return;
    }

    if (!cardCVC.trim() || cardCVC.length < 3) {
      toast.error("Please enter a valid CVC");
      return;
    }

    setProcessingPayment(true);
    try {
      // TODO: Replace with actual Stripe Payment Intent creation
      // For now, creating order with card payment intention
      const response = await ordersApi.create({
        items: [
          {
            product_id: parseInt(productId || "0"),
            variant_id: variant.id,
            quantity: quantity,
          },
        ],
      });

      const orderData: OrderResponse = response.data;

      toast.success(
        `Order #${orderData.data.id} placed! Payment of $${orderData.data.total_amount.toFixed(2)} processing...`,
      );

      // Store order details and navigate to confirmation
      navigate("/home", {
        state: {
          orderId: orderData.data.id,
          orderStatus: "processing",
        },
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= variant.stock) {
      setQuantity(num);
    } else {
      toast.error(`Quantity must be between 1 and ${variant.stock}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            {/* Product Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Variant ID</span>
                <span className="font-semibold text-gray-900">
                  #{variant.id}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Attributes</span>
                <span className="font-semibold text-gray-900 text-right max-w-xs">
                  {variant.attributes}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-semibold text-green-600">
                  ${variant.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-gray-600 font-medium">Quantity</span>
                <span className="font-bold text-blue-600 text-lg">
                  {quantity}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 pb-6 border-b border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Subtotal ({quantity} × ${variant.price.toFixed(2)})
                </span>
                <span className="text-gray-900">
                  ${(variant.price * quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (0%)</span>
                <span className="text-gray-900">$0.00</span>
              </div>
            </div>

            {/* Total - Highlighted */}
            <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
              <span className="text-lg font-bold text-gray-900">
                Order Total
              </span>
              <span className="text-3xl font-bold text-green-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Stock Info */}
            {variant.stock === 0 ? (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                <p className="text-sm text-red-900 font-semibold">
                  ✕ Out of Stock
                </p>
                <p className="text-xs text-red-700 mt-1">
                  This item is currently unavailable
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">✓ In Stock:</span>{" "}
                  {variant.stock} items available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {variant.stock === 0 && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="font-semibold">Out of Stock</p>
              <p className="text-sm">
                This item is currently unavailable. Please check back later.
              </p>
            </div>
          )}

          {/* Shipping Information */}
          <div
            className={`bg-white rounded-lg shadow p-6 mb-6 ${variant.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Shipping Information
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={cardEmail}
                    onChange={(e) => setCardEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={cardPhone}
                    onChange={(e) => setCardPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity * (Stock: {variant.stock})
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      handleQuantityChange((quantity - 1).toString())
                    }
                    disabled={quantity <= 1}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3"
                    size="sm"
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={variant.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="text-center text-lg font-semibold"
                  />
                  <Button
                    onClick={() =>
                      handleQuantityChange((quantity + 1).toString())
                    }
                    disabled={quantity >= variant.stock}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3"
                    size="sm"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div
            className={`bg-white rounded-lg shadow p-6 mb-6 ${variant.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Payment Method
            </h3>

            <div className="space-y-3 mb-6">
              {/* Cash on Delivery */}
              <label
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900">
                        Cash on Delivery
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
              </label>

              {/* Debit Card */}
              <label
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900">
                        Debit/Credit Card
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Secure payment via Stripe
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Card Details Form - Show when Card is selected */}
            {paymentMethod === "card" && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.slice(0, 19))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date (MM/YY) *
                    </label>
                    <Input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) =>
                        setCardExpiry(e.target.value.slice(0, 5))
                      }
                      placeholder="12/25"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC *
                    </label>
                    <Input
                      type="text"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value.slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Button */}
          {variant.stock === 0 ? (
            <Button
              disabled={true}
              className="w-full bg-gray-400 cursor-not-allowed text-white py-3 text-lg font-semibold"
            >
              Out of Stock
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!paymentMethod) {
                  toast.error("Please select a payment method");
                  return;
                }
                if (paymentMethod === "cod") {
                  handleCODOrder();
                } else {
                  handleCardPayment();
                }
              }}
              disabled={!paymentMethod || processingPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Place Order - $${totalPrice.toFixed(2)}`
              )}
            </Button>
          )}

          {/* Security Info */}
          <p className="text-center text-sm text-gray-600 mt-4">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
