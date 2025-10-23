export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'customer' | 'admin';
  agree_marketing?: boolean;
  created_at: string;
  updated_at: string;
  // 옵셔널 필드들 (데이터베이스에 없는 필드들)
  address?: string;
  postal_code?: string;
  total_transactions?: number;
  total_amount?: number;
}

export type GoldType = 'porcelain' | 'inlay_s' | 'inlay' | 'crown_pt' | 'crown_st' | 'crown_at';

export const GOLD_TYPES: Record<GoldType, string> = {
  porcelain: '포세린',
  inlay_s: '인레이S',
  inlay: '인레이',
  crown_pt: '크라운PT',
  crown_st: '크라운ST',
  crown_at: '크라운AT'
};

export interface GoldPrice {
  id: string;
  date: string;
  price_porcelain: number;   // 포세린
  price_inlay_s: number;     // 인레이S
  price_inlay: number;       // 인레이
  price_crown_pt: number;    // 크라운PT
  price_crown_st: number;    // 크라운ST
  price_crown_at: number;    // 크라운AT
  source?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoldItem {
  type: GoldType;
  quantity: number;
  weight?: number;
  description?: string;
}

export interface PurchaseRequest {
  id: string;
  user_id: string;
  request_number: string;
  customer_name: string;
  phone: string;
  bank_name?: string;
  account_number?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  items: GoldItem[];
  estimated_price?: number;
  status: 'pending' | 'shipped' | 'received' | 'evaluating' | 'evaluated' | 'approved' | 'confirmed' | 'paid' | 'deposited';
  tracking_number?: string;
  shipping_carrier?: string;
  received_date?: string;
  customer_images?: string[]; // 고객이 업로드한 신청 시 사진
  evaluation_notes?: string;
  evaluation_images?: string[]; // 관리자가 감정 시 촬영한 사진
  final_weight?: number;
  final_price?: number;
  price_difference?: number;
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  request_id: string;
  status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface Settlement {
  id: string;
  request_id: string;
  settlement_number: string;
  user_id: string;
  final_amount: number;
  deduction_amount: number;
  deduction_reason?: string;
  net_amount: number;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  payment_method: 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_date?: string;
  payment_proof_url?: string;
  processed_by?: string;
  created_at: string;
}

export interface Review {
  id: string;
  purchase_request_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  is_public: boolean;
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'status_change' | 'settlement' | 'review_reply';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  todayRequests: number;
  pendingRequests: number;
  monthlyRevenue: number;
  activeUsers: number;
  avgProcessingTime: number;
  satisfactionRate: number;
  recentRequests: PurchaseRequest[];
  topCustomers: User[];
}

export const MEMBER_GRADES = {
  bronze: { min: 0, max: 1000000, rate: 0.4 },
  silver: { min: 1000001, max: 5000000, rate: 0.42 },
  gold: { min: 5000001, max: 10000000, rate: 0.44 },
  platinum: { min: 10000001, max: null, rate: 0.45 }
} as const;

export const PERMISSIONS = {
  customer: [
    'view_own_requests',
    'create_request',
    'view_own_settlements',
    'create_review'
  ],
  admin: [
    'view_all_requests',
    'update_request_status',
    'create_settlement',
    'process_payment',
    'view_statistics',
    'manage_users',
    'manage_reviews'
  ]
} as const;