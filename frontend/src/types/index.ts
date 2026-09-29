export type UserRole = 'super_admin' | 'admin' | 'agent' | 'viewer';

export interface Business {
  id: number;
  name: string;
  email: string;
  domain: string;
  role?: UserRole;
  public_widget_key?: string;
  logo_url: string | null;
  timezone: string;
  created_at: string;
}

export interface AuthResponse {
  user: Business;
  token: string;
}

export interface KnowledgeSource {
  id: number;
  business_id: number;
  type: 'faq' | 'url' | 'document' | 'catalog';
  title: string;
  content: string;
  url: string | null;
  file_path: string | null;
  status: 'approved' | 'draft' | 'conflicted' | 'processing' | 'error' | 'active';
  freshness?: string;
  origin?: string;
  extracted_chunks?: string[];
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGap {
  id: number;
  business_id: number;
  question: string;
  frequency: number;
  last_asked: string;
  suggested_answer: string;
  status: 'pending_review' | 'approved';
  related_conversation_ids?: string[];
}

export interface Conversation {
  id: string;
  business_id: number;
  customer_name: string | null;
  customer_email: string | null;
  status: 'ai_active' | 'needs_human' | 'human_active' | 'closed' | 'reopened';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channel: string;
  unread_count?: number;
  assigned_to: number | null;
  ai_summary?: string;
  waiting_time?: string;
  last_activity?: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  latest_message?: Message;
}

export interface Message {
  id: number;
  conversation_id: string;
  role: 'customer' | 'assistant' | 'agent' | 'system';
  content: string;
  sources?: SourceReference[] | null;
  is_internal_note?: boolean;
  author?: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface SourceReference {
  title: string;
  type: string;
  excerpt?: string;
}

export interface Feedback {
  id: number;
  message_id: number | null;
  conversation_id: string;
  business_id: number;
  rating: 'helpful' | 'unhelpful';
  comment: string | null;
  created_at: string;
}

export interface TeamMember {
  id: number;
  business_id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  created_at: string;
}

export interface WidgetConfig {
  id: number;
  business_id: number;
  public_widget_key?: string;
  assistant_name: string;
  welcome_message: string;
  brand_color: string;
  position: 'left' | 'right';
  logo_url: string | null;
  suggested_questions: string[] | null;
  business_hours: BusinessHours | null;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  hours: Record<string, { open: string; close: string } | null>;
}

export interface WidgetStatus {
  business_id: string;
  public_key: string;
  installed: boolean;
  last_connected_at: string | null;
  connected_origin: string | null;
  ping_count: number;
  troubleshooting_tips: string[];
}

export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  price: string;
  numeric_price: number;
  inStock: boolean;
  inventory_count: number;
  category: string;
  url?: string;
  last_synced?: string;
}

export interface CatalogSyncState {
  platform: string;
  store_url: string;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'partial' | 'failed';
  progress: number;
  scheduled_enabled: boolean;
  schedule_interval: string;
  next_scheduled_run: string;
  last_successful_sync: string;
  imported_count: number;
  discovered_count: number;
  duplicate_count: number;
  failed_count: number;
  products: ProductItem[];
}

export interface AnalyticsOverview {
  timeframe_days?: number;
  total_conversations: number;
  total_messages: number;
  ai_resolved_count?: number;
  ai_resolution_rate?: number;
  human_handoffs: number;
  human_handoff_rate?: number;
  avg_first_human_response_mins?: number;
  unanswered_questions_count?: number;
  avg_satisfaction: number;
  customer_feedback_total?: number;
  helpful_count?: number;
  unhelpful_count?: number;
  estimated_tokens_used?: number;
  estimated_ai_cost_usd?: string;
  conversations_by_day: { date: string; count: number }[];
  recent_conversations: Conversation[];
}

export interface AuditLog {
  id: string;
  business_id: number;
  actor: string;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AIRule {
  id: number;
  business_id: number;
  name: string;
  category: 'guardrail' | 'policy' | 'routing' | 'compliance';
  description: string;
  prompt_directive: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Knowledge' | 'Inbox' | 'Settings' | 'Team' | 'System';
}

export interface RolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  domain: string;
  plan: 'Starter' | 'Growth' | 'Business' | 'Enterprise';
  status: 'active' | 'suspended';
  conversations_count: number;
  sources_count: number;
  monthly_messages: number;
  message_limit: number;
  created_at: string;
}
