// Domain types mirroring supabase/migrations/0001_init_schema.sql.
// Keep in sync with the schema by hand until a live Supabase project exists
// and `supabase gen types typescript` can generate these automatically.

export type OrgRole =
  "platform_owner" | "org_owner" | "market_manager" | "compliance_manager" | "finance_manager";

export type VendorApplicationStatus =
  | "submitted"
  | "document_review"
  | "approved"
  | "agreement_signed"
  | "payment_setup"
  | "activated"
  | "rejected";

export type DocumentType =
  | "business_license"
  | "food_permit"
  | "insurance_certificate"
  | "organic_certification"
  | "health_department_document"
  | "safety_document"
  | "other_certification";

export type DocumentStatus =
  "pending_review" | "verified" | "expiring_soon" | "expired" | "update_requested" | "rejected";

export type AttendanceStatus = "attending" | "absent" | "late";
export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  default_currency: string;
  default_locale: string;
  subscription_plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_platform_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
}

export interface Market {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  hero_image_url: string | null;
  market_type: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  owner_user_id: string | null;
  business_name: string;
  farm_story: string | null;
  farm_location: string | null;
  product_categories: string[] | null;
  website: string | null;
  photos: string[] | null;
  farming_practices: string[] | null;
  insurance_uploaded: boolean;
  permit_verified: boolean;
  agreement_signed: boolean;
  fees_paid: boolean;
  status: "pending" | "active" | "suspended" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface VendorApplication {
  id: string;
  organization_id: string;
  vendor_id: string | null;
  market_id: string | null;
  applicant_name: string;
  applicant_email: string;
  status: VendorApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceDocument {
  id: string;
  organization_id: string;
  vendor_id: string;
  document_type: DocumentType;
  title: string;
  file_url: string | null;
  status: DocumentStatus;
  issued_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booth {
  id: string;
  organization_id: string;
  market_id: string;
  code: string;
  pos_x: number | null;
  pos_y: number | null;
}

export interface Schedule {
  id: string;
  organization_id: string;
  market_id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string | null;
}

export interface BoothAssignment {
  id: string;
  organization_id: string;
  schedule_id: string;
  booth_id: string;
  vendor_id: string | null;
  attendance: AttendanceStatus;
}

export interface Announcement {
  id: string;
  organization_id: string;
  market_id: string | null;
  audience: "all_vendors" | "specific_vendors" | "customers";
  channel: "in_app" | "email" | "sms";
  message: string;
  sent_at: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  currency: string;
  unit: string | null;
  photo_url: string | null;
  photo_urls: string[] | null;
  is_subscription_eligible: boolean;
  subscription_frequencies: SubscriptionFrequency[] | null;
  is_active: boolean;
}

export interface Order {
  id: string;
  organization_id: string;
  customer_id: string;
  vendor_id: string;
  market_id: string | null;
  status: OrderStatus;
  fulfillment_type: "pickup" | "delivery";
  pickup_time: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  vendor_id: string | null;
  order_id: string | null;
  purpose: "booth_fee" | "membership_fee" | "platform_subscription" | "product_order";
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  created_at: string;
}
