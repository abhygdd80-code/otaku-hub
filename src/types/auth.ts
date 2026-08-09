// ─── User Profile ──────────────────────────────────────────────

export interface CustomerAddress {
  id: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  zip?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  formatted?: string[] | null;
}

export interface CustomerOrderLineItem {
  title: string;
  quantity: number;
  variantTitle?: string | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

export interface CustomerFulfillment {
  trackingCompany?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  status?: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  name: string;
  processedAt: string;
  statusUrl: string;
  totalPrice: number;
  currencyCode: string;
  subtotalPrice: number;
  totalShippingPrice: number;
  totalTax: number;
  fulfillmentStatus?: string | null;
  financialStatus?: string | null;
  lineItems: CustomerOrderLineItem[];
  fulfillments: CustomerFulfillment[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  /** Shopify customer GID — present when the profile is Shopify-backed. */
  shopifyId?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  /** Marketing/email consent — defaults to true for mock accounts. */
  acceptsMarketing?: boolean;
  addresses?: CustomerAddress[];
  defaultAddress?: CustomerAddress | null;
  orders?: CustomerOrder[];
}

/** Mutable profile fields accepted by the account settings form. */
export interface ProfileUpdateInput {
  name?: string;
  avatar?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Marketing/email consent — toggled from account settings. */
  acceptsMarketing?: boolean;
}

// ─── Credentials ───────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ─── Store ─────────────────────────────────────────────────────

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  /** Reconcile the persisted session against the server cookie. */
  initSession: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateInput) => Promise<void>;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
