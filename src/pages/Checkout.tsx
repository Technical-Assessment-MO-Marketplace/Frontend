import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ChevronLeft, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/Loading";
import type { Variant, CheckoutState, OrderResponse } from "@/types";

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

    // Validate variant has required properties
    const variantData = state.variant;
    if (
      !variantData.id ||
      variantData.price === undefined ||
      variantData.price === null
    ) {
      toast.error("Invalid variant data. Missing price or ID.");
      console.error("Invalid variant data:", variantData);
      navigate("/products");
      return;
    }

    setVariant(variantData);
    setProductId(state.productId);
  }, [location, navigate]);

  if (!variant) {
    return <LoadingSpinner message="Loading checkout..." variant="default" />;
  }

  // Safety check: ensure price is a valid number
  const price = Number(variant.price) || 0;
  if (price < 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Invalid Variant</h2>
          <p>This variant has invalid pricing information.</p>
          <Button
            onClick={() => navigate("/products")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = price * quantity;

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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-4 py-6 sm:py-8 md:py-12">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="mb-6 flex items-center gap-2 text-xs sm:text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-20">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Order Summary
            </h2>

            {/* Product Details */}
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-between mb-2 sm:mb-3 text-xs sm:text-sm">
                <span className="text-gray-600">Variant ID</span>
                <span className="font-semibold text-gray-900">
                  #{variant.id}
                </span>
              </div>
              <div className="flex justify-between mb-2 sm:mb-3 text-xs sm:text-sm">
                <span className="text-gray-600">Attributes</span>
                <span className="font-semibold text-gray-900 text-right max-w-xs text-xs">
                  {(() => {
                    if (
                      Array.isArray(variant.attributes) &&
                      variant.attributes.length > 0
                    ) {
                      return variant.attributes
                        .map((attr: any) => {
                          if (typeof attr === "object" && attr.attribute_name) {
                            return `${attr.attribute_name}: ${attr.attribute_value || ""}`;
                          }
                          return String(attr);
                        })
                        .join(", ");
                    }
                    if (typeof variant.attributes === "string") {
                      return variant.attributes;
                    }
                    return "No attributes";
                  })()}
                </span>
              </div>
              <div className="flex justify-between mb-2 sm:mb-3 text-xs sm:text-sm">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-semibold text-green-600">
                  ${variant.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between bg-blue-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
                <span className="text-gray-600 font-medium">Quantity</span>
                <span className="font-bold text-blue-600 text-base sm:text-lg">
                  {quantity}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">
                  Subtotal ({quantity} × ${variant.price.toFixed(2)})
                </span>
                <span className="text-gray-900 font-medium">
                  ${(variant.price * quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Tax (0%)</span>
                <span className="text-gray-900 font-medium">$0.00</span>
              </div>
            </div>

            {/* Total - Highlighted */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border-2 border-green-200">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                Order Total
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-green-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Stock Info */}
            {variant.stock === 0 ? (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs sm:text-sm">
                <p className="text-red-900 font-semibold">✕ Out of Stock</p>
                <p className="text-red-700 mt-1">
                  This item is currently unavailable
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs sm:text-sm">
                <p className="text-blue-900">
                  <span className="font-semibold">✓ In Stock:</span>{" "}
                  {variant.stock} items available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {variant.stock === 0 && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-6 rounded text-xs sm:text-sm">
              <p className="font-semibold">Out of Stock</p>
              <p className="text-xs">
                This item is currently unavailable. Please check back later.
              </p>
            </div>
          )}

          {/* Shipping Information */}
          <div
            className={`bg-white rounded-lg shadow p-4 sm:p-6 mb-6 ${variant.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-lg sm:text-lg font-bold text-gray-900 mb-4">
              Shipping Information
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={cardEmail}
                    onChange={(e) => setCardEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={cardPhone}
                    onChange={(e) => setCardPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Quantity * (Stock: {variant.stock})
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() =>
                      handleQuantityChange((quantity - 1).toString())
                    }
                    disabled={quantity <= 1}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 sm:px-3"
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
                    className="text-center text-base sm:text-lg font-semibold"
                  />
                  <Button
                    onClick={() =>
                      handleQuantityChange((quantity + 1).toString())
                    }
                    disabled={quantity >= variant.stock}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 sm:px-3"
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
            className={`bg-white rounded-lg shadow p-4 sm:p-6 mb-6 ${variant.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Payment Method
            </h3>

            <div className="space-y-3 mb-6">
              {/* Cash on Delivery */}
              <label
                className="border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900 text-xs sm:text-base">
                        Cash on Delivery
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
              </label>

              {/* Debit Card */}
              <label
                className="border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      <p className="font-semibold text-gray-900 text-xs sm:text-base">
                        Debit/Credit Card
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.slice(0, 19))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      CVC *
                    </label>
                    <Input
                      type="text"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value.slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="text-xs sm:text-sm"
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
              className="w-full bg-gray-400 cursor-not-allowed text-white py-2 sm:py-3 text-base sm:text-lg font-semibold"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-base sm:text-lg font-semibold"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center gap-2 text-xs sm:text-base">
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                `Place Order - $${totalPrice.toFixed(2)}`
              )}
            </Button>
          )}

          {/* Security Info */}
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
