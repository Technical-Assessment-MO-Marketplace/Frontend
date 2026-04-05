// PROFILE TYPES

export interface ProfileData {
  email: string;
}

// ============================================
export interface User {
  id?: number;
  userId?: number;
  name?: string;
  email: string;
  role_id?: number;
  roleId?: number;
  role?: string | number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ============================================
// PRODUCT TYPES
// ============================================
export interface Product {
  id: number;
  name: string;
  description: string;
}

export interface Variant {
  id: number;
  product_id: number;
  attributes: string;
  price: number;
  stock: number;
  created_at?: string;
  [key: string]: any;
}

// ============================================
// ATTRIBUTE TYPES
// ============================================
export interface AttributeValue {
  id: number;
  value: string;
  attribute_value_id?: number;
}

export interface Attribute {
  id?: number;
  attribute_id?: number;
  name?: string;
  attribute_name?: string;
  values?: AttributeValue[];
}

export interface VariantAttribute {
  attribute_name: string;
  attribute_value: string;
  attribute_value_id: number;
}

// ============================================
// ORDER TYPES
// ============================================
export interface OrderItem {
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

export interface Order {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total_amount: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

export interface CheckoutState {
  variant: Variant;
  productId: string;
}

export interface OrderResponse {
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
    }>;
  };
}

// ============================================
// MODAL PROPS TYPES
// ============================================
export interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export interface CreateVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: number | null;
  productName?: string;
}

export interface CreateAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AddAttributeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attributeId: number;
  attributeName: string;
}

export interface ProfileDropdownProps {
  onClose: () => void;
}

// ============================================
// COMPONENT PROPS TYPES
// ============================================
export interface LoadingSpinnerProps {
  message?: string;
  variant?: "default" | "centered" | "compact" | "profile";
  fullHeight?: boolean;
}

// ============================================
// ERROR COMPONENT TYPES
// ============================================
export interface ErrorDisplayProps {
  message: string;
  variant?: "default" | "card" | "profile" | "inline";
  onRetry?: () => void;
  onBack?: () => void;
  title?: string;
}
