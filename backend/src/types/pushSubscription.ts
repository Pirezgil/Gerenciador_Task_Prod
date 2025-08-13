// ============================================================================
// PUSH SUBSCRIPTION TYPES - Tipos para gerenciamento de assinaturas push
// ============================================================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: PushSubscriptionKeys;
}

export interface CreatePushSubscriptionRequest {
  subscription: PushSubscriptionData;
  userAgent?: string;
}

export interface PushSubscriptionResponse {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  isActive: boolean;
  lastNotificationSent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscriptionFilter {
  isActive?: boolean;
}

// Tipos para validação
export interface PushSubscriptionValidationError {
  field: string;
  message: string;
}